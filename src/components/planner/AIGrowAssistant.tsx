import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIGrowAssistantProps {
  plannerData: {
    location: string;
    experience: string;
    space: string;
    goals: string[];
  };
}

export default function AIGrowAssistant({ plannerData }: AIGrowAssistantProps) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const generateAISuggestion = async () => {
    setLoading(true);
    try {
      const prompt = `Based on my location (${plannerData.location}), experience level (${plannerData.experience}), growing space (${plannerData.space}), and goals (${plannerData.goals.join(', ')}), what should I grow this season? Please provide specific plant recommendations with brief explanations.`;

      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = async () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Save to local storage
        const savedInputs = JSON.parse(localStorage.getItem('voiceInputs') || '[]');
        savedInputs.push({
          text: transcript,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('voiceInputs', JSON.stringify(savedInputs));
        
        toast({
          title: 'Voice Input Saved',
          description: 'Your voice input has been saved to local storage.',
        });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Error',
          description: 'Failed to process voice input. Please try again.',
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Voice input is not supported in your browser.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Grow Assistant</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={startVoiceInput}
            disabled={isRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={generateAISuggestion}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Suggestions...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Get AI Suggestions
              </>
            )}
          </Button>

          {suggestion && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">AI Suggestions:</h3>
              <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 