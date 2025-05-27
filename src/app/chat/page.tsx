'use client';

import React, { useState, useEffect, useRef } from 'react';
import { runFlow } from '@genkit-ai/flow/client';
import { chatAssistantFlow } from '@/ai/flows/chat-assistant-flow';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Splash screen duration
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const currentMessageText = inputValue.trim();
    if (!currentMessageText || isAiTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessageText,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsAiTyping(true);

    try {
      const flowResponse = await runFlow(chatAssistantFlow, { message: currentMessageText });
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: flowResponse.response,
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error calling AI flow:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'ai', 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <video
          src="/Chat-AI.mp4"
          autoPlay
          muted
          onEnded={handleVideoEnd}
          style={{ width: '100%', maxWidth: '600px', height: 'auto', objectFit: 'contain', borderRadius: '8px' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', /* Adjusted for potential header/nav */ padding: '1rem', backgroundColor: 'var(--background)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--foreground)' }}>AgriPedia Chat Assistant</h1>
      
      <div className="custom-scrollbar" style={{ flexGrow: 1, border: '1px solid var(--border)', padding: '10px', marginBottom: '10px', overflowY: 'auto', borderRadius: '8px', backgroundColor: 'var(--muted)' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            marginBottom: '10px',
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--secondary)',
              color: msg.sender === 'user' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
              maxWidth: '70%',
              wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div style={{ textAlign: 'left', color: 'var(--muted-foreground)', fontStyle: 'italic', padding: '5px 0' }}>
            AgriPedia AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{ 
            flexGrow: 1, 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            backgroundColor: 'var(--input)', 
            color: 'var(--foreground)',
            opacity: isAiTyping ? 0.7 : 1,
          }}
          onKeyPress={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendMessage(); }}}
          disabled={isAiTyping}
        />
        <button
          onClick={handleSendMessage}
          style={{ 
            padding: '10px 15px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--primary)', 
            color: 'var(--primary-foreground)', 
            border: 'none', 
            cursor: isAiTyping ? 'not-allowed' : 'pointer', 
            opacity: isAiTyping ? 0.7 : 1 
          }}
          disabled={isAiTyping}
        >
          {isAiTyping ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
