
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2, Play } from 'lucide-react';
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
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
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
    <Card className="w-full max-w-2xl mx-auto h-[calc(100vh-150px)] md:h-[calc(100vh-120px)] flex flex-col shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className="bg-card-foreground/5 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bot className="text-primary" />
          AgriPedia AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {chatHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <Avatar className="h-8 w-8 border border-primary/50">
                    <AvatarImage src="https://placehold.co/40x40/1305055/FFFFFF/png?text=AI" alt="AI" data-ai-hint="bot avatar" />
                    <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] sm:max-w-[65%] p-3 rounded-xl shadow-md break-words ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none border border-border'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 border border-muted-foreground/50">
                     <AvatarImage src="https://placehold.co/40x40/FFFFFF/151921/png?text=U" alt="User" data-ai-hint="user avatar" />
                    <AvatarFallback className="bg-muted/50 text-muted-foreground">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoadingResponse && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border border-primary/50">
                    <AvatarImage src="https://placehold.co/40x40/1305055/FFFFFF/png?text=AI" alt="AI" data-ai-hint="bot avatar" />
                    <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                </Avatar>
                <div className="bg-card text-card-foreground p-3 rounded-xl shadow-md border border-border rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t border-border bg-card-foreground/5">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
          <Input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about fruits or vegetables..."
            className="flex-1 bg-input border-border focus:border-primary rounded-lg text-base"
            disabled={isLoadingResponse}
          />
          <Button type="submit" disabled={isLoadingResponse || !inputValue.trim()} className="rounded-lg">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
