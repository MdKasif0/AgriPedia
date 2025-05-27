'use client';

import { useState, useRef, useEffect } from 'react';
import VideoPreloader from '@/components/ui/VideoPreloader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react'; // Imported Loader2
import { runFlow } from '@genkit-ai/flow/client'; // Import from new client path
import { chatWithAgriAI } from '../../ai/flows/chat-assistant-flow'; // Updated import path

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatPage() {
  const [showChatPreloader, setShowChatPreloader] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome! How can I help you with agriculture today?", sender: 'ai' }
  ]);
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false); // Added loading state
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => { // Made async
    if (inputValue.trim() === "" || isLoadingAIResponse) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    const currentInput = inputValue; // Capture before clearing
    setInputValue("");
    setIsLoadingAIResponse(true);
    
    const thinkingMessageId = Date.now() + 1; // Unique ID for the thinking message
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      text: "AgriAI is thinking...",
      sender: 'ai',
    };
    setMessages(prevMessages => [...prevMessages, thinkingMessage]);
    // scrollToBottom(); // Ensure this is called after state update, useEffect handles it

    try {
      const flowResult = await runFlow(chatWithAgriAI, { message: currentInput });
      const aiResponse: Message = {
        id: thinkingMessageId, // Use the same ID to replace the thinking message
        text: flowResult.response,
        sender: 'ai',
      };
      setMessages(prevMessages =>
        prevMessages.map(msg => (msg.id === thinkingMessageId ? aiResponse : msg))
      );
    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorMessage: Message = {
        id: thinkingMessageId, // Use the same ID to replace the thinking message
        text: "Sorry, something went wrong. Please try again.",
        sender: 'ai',
      };
      setMessages(prevMessages =>
        prevMessages.map(msg => (msg.id === thinkingMessageId ? errorMessage : msg))
      );
    } finally {
      setIsLoadingAIResponse(false);
    }
  };

  if (showChatPreloader) {
    return (
      <VideoPreloader
        videoSrc="/Chat-AI.mp4"
        onVideoEnd={() => setShowChatPreloader(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-160px)] max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">AgriAI Assistant</h1>
      
      <div className="flex-grow bg-muted/50 p-4 rounded-lg shadow-inner overflow-y-auto mb-4 space-y-2">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`p-3 rounded-lg max-w-[70%] shadow ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card text-card-foreground'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center gap-2 sticky bottom-4">
        <Input 
          type="text" 
          placeholder={isLoadingAIResponse ? "AgriAI is responding..." : "Ask something about agriculture..."}
          className="flex-grow text-base p-3"
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoadingAIResponse} // Disable input when loading
        />
        <Button 
          variant="default" 
          size="lg" 
          aria-label="Send message" 
          className="p-3"
          onClick={handleSendMessage}
          disabled={isLoadingAIResponse} // Disable button when loading
        >
          {isLoadingAIResponse ? (
            <Loader2 className="h-5 w-5 animate-spin" /> 
          ) : (
            <Send size={22} />
          )}
        </Button>
      </div>
    </div>
  );
}
