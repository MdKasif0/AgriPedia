
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2, Play, Download } from 'lucide-react'; // Added Download
import { sendChatMessage } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function ChatPage() {
  const [isPreloadingVideo, setIsPreloadingVideo] = useState(true);
  const [videoPlayedOnce, setVideoPlayedOnce] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.children[1] as HTMLDivElement; // Access the underlying viewport div
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [chatHistory]);

  useEffect(() => {
    // Attempt to play video on component mount if not played yet
    if (videoRef.current && !videoPlayedOnce) {
      videoRef.current.play().catch(error => {
        console.warn("Video autoplay was prevented:", error, "User interaction might be needed to play the video.");
        // Show a play button if autoplay fails and video hasn't played
        setIsPreloadingVideo(true); // Keep preloader visible
      });
    }
  }, [videoPlayedOnce]);


  const handleVideoEnd = () => {
    setIsPreloadingVideo(false);
    setVideoPlayedOnce(true);
  };
  
  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleExportChatHistory = () => {
    const formattedHistory = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    const blob = new Blob([formattedHistory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agripedia-chat-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoadingResponse) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputValue,
    };
    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoadingResponse(true);

    try {
      const aiResponseContent = await sendChatMessage(userMessage.content, chatHistory.slice(-6)); // Send last 3 turns (6 messages)
      if (aiResponseContent) {
        const aiMessage: ChatMessage = {
          id: Date.now().toString() + '-model',
          role: 'model',
          content: aiResponseContent,
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        const errorResponseMessage: ChatMessage = {
          id: Date.now().toString() + '-error',
          role: 'model',
          content: "Sorry, I couldn't get a response. Please try again.",
        };
        setChatHistory(prev => [...prev, errorResponseMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        role: 'model',
        content: 'An error occurred. Please try again later.',
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  if (isPreloadingVideo && !videoPlayedOnce) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-auto h-auto min-w-full min-h-full object-cover"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={() => {
            console.error("Video failed to load or play.");
            // Fallback if video errors out, to prevent user from being stuck
             // Allow user to click to play if autoplay fails
            if (videoRef.current && videoRef.current.paused) {
                 // Don't automatically hide, wait for button press if needed
            } else {
                 handleVideoEnd(); // If error wasn't about autoplay (e.g. bad src)
            }
          }}
        >
          <source src="/videos/Chat-AI.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {videoRef.current && videoRef.current.paused && !videoPlayedOnce && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-4 hover:bg-black/70"
            onClick={handlePlayButtonClick}
            aria-label="Play video"
          >
            <Play size={48} />
          </Button>
        )}
      </div>
    );
  }

  return (
    // Ensure this Card is within a flex container in your layout that gives it space to grow.
    // For example, the parent div of this Card could be <div className="flex flex-col flex-grow">
    <Card className="w-full max-w-3xl mx-auto flex flex-col shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 h-full max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]">
      <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <Bot className="text-teal-600 dark:text-teal-500 h-7 w-7" />
            <span className="text-xl font-semibold">AgriPedia AI Assistant</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportChatHistory}
            aria-label="Export chat history"
            className="text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-500"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      {/* Making CardContent flex-grow and ScrollArea h-full */}
      <CardContent className="flex-1 p-0 overflow-hidden"> 
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 sm:p-6 space-y-5">
            {chatHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${ // changed to items-end for tail alignment
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-600 flex-shrink-0">
                    <AvatarImage src="https://placehold.co/40x40/2DD4BF/FFFFFF/png?text=AI" alt="AI" />
                    <AvatarFallback className="bg-teal-500 text-white">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] md:max-w-[70%] p-3.5 text-sm md:text-base shadow-md break-words ${ // increased padding slightly
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-t-2xl rounded-bl-2xl' // More rounded, distinct tail
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-t-2xl rounded-br-2xl border border-slate-200 dark:border-slate-600' // More rounded, distinct tail
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-600 flex-shrink-0">
                     <AvatarImage src="https://placehold.co/40x40/FFFFFF/334155/png?text=U" alt="User" />
                    <AvatarFallback className="bg-slate-300 text-slate-700 dark:bg-slate-500 dark:text-slate-200">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoadingResponse && (
              <div className="flex items-start gap-2.5 justify-start">
                <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-600 flex-shrink-0">
                    <AvatarImage src="https://placehold.co/40x40/2DD4BF/FFFFFF/png?text=AI" alt="AI" />
                    <AvatarFallback className="bg-teal-500 text-white">AI</AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-3.5 rounded-t-2xl rounded-br-2xl shadow-md border border-slate-200 dark:border-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2.5">
          <Input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about fruits, vegetables, or farming..."
            className="flex-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:ring-offset-0 dark:focus-visible:ring-offset-slate-800 rounded-xl text-base py-3 px-4"
            disabled={isLoadingResponse}
          />
          <Button 
            type="submit" 
            disabled={isLoadingResponse || !inputValue.trim()} 
            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-xl p-3 aspect-square"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
