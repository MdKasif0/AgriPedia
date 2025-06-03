import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertTriangle, Lightbulb, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import GrowingGuideNotifications from './GrowingGuideNotifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface GrowingStage {
  stage: string;
  duration_days: number;
  instructions: string[];
  media?: {
    images?: string[];
    video?: string;
  };
  tools_needed?: string[];
  tips?: string[];
  warnings?: string[];
  reminders?: string[];
  completed?: boolean;
}

interface GrowingGuideProps {
  plantId: string;
  commonName: string;
  scientificName: string;
  growingGuide: GrowingStage[];
  startDate: Date;
  userPreferences: {
    location: string;
    space: string;
    experience: string;
  };
}

interface NotificationPreferences {
  stageNotifications: boolean;
  reminderNotifications: boolean;
  tipNotifications: boolean;
  notificationTone: 'motivational' | 'minimal' | 'scientific';
}

export default function GrowingGuide({
  plantId,
  commonName,
  scientificName,
  growingGuide,
  startDate,
  userPreferences,
}: GrowingGuideProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  // Calculate progress
  const totalSteps = growingGuide.reduce((acc, stage) => acc + stage.instructions.length, 0);
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progress = (completedCount / totalSteps) * 100;

  // Calculate stage dates
  const getStageDates = (stageIndex: number) => {
    let start = new Date(startDate);
    for (let i = 0; i < stageIndex; i++) {
      start.setDate(start.getDate() + growingGuide[i].duration_days);
    }
    const end = new Date(start);
    end.setDate(end.getDate() + growingGuide[stageIndex].duration_days);
    return { start, end };
  };

  const toggleStep = (stageIndex: number, stepIndex: number) => {
    const key = `${stageIndex}-${stepIndex}`;
    setCompletedSteps(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`guide-progress-${plantId}`, JSON.stringify(newState));
      return newState;
    });
  };

  const handleNotificationPreferenceChange = (preferences: NotificationPreferences) => {
    // Save notification preferences
    localStorage.setItem(
      `notification-preferences-${plantId}`,
      JSON.stringify(preferences)
    );
  };

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `For ${commonName} (${scientificName}) in the ${growingGuide[currentStage].stage} stage, ${aiQuestion}. Consider these growing conditions: Location: ${userPreferences.location}, Space: ${userPreferences.space}, Experience: ${userPreferences.experience}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAiResponse(data.suggestion);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{commonName}</h2>
            <p className="text-sm text-muted-foreground">{scientificName}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIChat(true)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Growing Stages */}
          <Accordion type="single" collapsible className="w-full">
            {growingGuide.map((stage, stageIndex) => {
              const { start, end } = getStageDates(stageIndex);
              const isCurrentStage = stageIndex === currentStage;

              return (
                <AccordionItem
                  key={stage.stage}
                  value={stage.stage}
                  className={`border rounded-lg mb-4 ${
                    isCurrentStage ? 'border-primary' : ''
                  }`}
                >
                  <AccordionTrigger className="px-4 py-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {stage.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Calendar className="w-5 h-5" />
                        )}
                        <span className="font-semibold">{stage.stage}</span>
                      </div>
                      <Badge variant="outline">
                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Instructions */}
                      <div className="space-y-2">
                        {stage.instructions.map((instruction, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted"
                          >
                            <Checkbox
                              checked={completedSteps[`${stageIndex}-${stepIndex}`]}
                              onCheckedChange={() => toggleStep(stageIndex, stepIndex)}
                            />
                            <span>{instruction}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tools Needed */}
                      {stage.tools_needed && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Tools Needed</h4>
                          <div className="flex flex-wrap gap-2">
                            {stage.tools_needed.map((tool, index) => (
                              <Badge key={index} variant="secondary">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips & Warnings */}
                      <Tabs defaultValue="tips" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="tips">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Tips
                          </TabsTrigger>
                          <TabsTrigger value="warnings">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Warnings
                          </TabsTrigger>
                          <TabsTrigger value="reminders">
                            <Calendar className="w-4 h-4 mr-2" />
                            Reminders
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="tips" className="space-y-2">
                          {stage.tips?.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 mt-1 text-yellow-500" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="warnings" className="space-y-2">
                          {stage.warnings?.map((warning, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-1 text-red-500" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="reminders" className="space-y-2">
                          {stage.reminders?.map((reminder, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 mt-1 text-blue-500" />
                              <span>{reminder}</span>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>

                      {/* Media Gallery */}
                      {stage.media && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Media Guide</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {stage.media.images?.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${stage.stage} step ${index + 1}`}
                                className="rounded-lg object-cover w-full h-48"
                              />
                            ))}
                          </div>
                          {stage.media.video && (
                            <video
                              controls
                              className="w-full rounded-lg"
                              src={stage.media.video}
                            />
                          )}
                        </div>
                      )}

                      {/* Notifications Settings */}
                      {isCurrentStage && (
                        <GrowingGuideNotifications
                          plantId={plantId}
                          plantName={commonName}
                          currentStage={stage}
                          stageIndex={stageIndex}
                          startDate={start}
                          onNotificationPreferenceChange={handleNotificationPreferenceChange}
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>

      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ask AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ask a question about growing this plant..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAiQuestion}
              disabled={isAiLoading || !aiQuestion.trim()}
              className="w-full"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Response...
                </>
              ) : (
                'Ask AI'
              )}
            </Button>
            {aiResponse && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 