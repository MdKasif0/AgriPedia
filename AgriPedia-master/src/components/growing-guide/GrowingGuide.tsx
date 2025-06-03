import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Info,
  MessageCircle,
  Camera,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { GrowingGuide as GrowingGuideType, PlantProgress } from '@/types/growingGuide';
import {
  getGrowingGuide,
  initializePlantProgress,
  getCurrentStage,
  updateStageProgress,
  getStageDates,
  saveProgress,
  loadProgress,
} from '@/services/growingGuideService';
import GrowingGuideChat from './GrowingGuideChat';

interface GrowingGuideProps {
  plantId: string;
  onComplete?: () => void;
}

export default function GrowingGuide({ plantId, onComplete }: GrowingGuideProps) {
  const { toast } = useToast();
  const [guide, setGuide] = useState<GrowingGuideType | null>(null);
  const [progress, setProgress] = useState<PlantProgress | null>(null);
  const [activeTab, setActiveTab] = useState('guide');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const guideData = getGrowingGuide(plantId);
    if (!guideData) {
      toast({
        title: 'Error',
        description: 'Growing guide not found for this plant',
        variant: 'destructive',
      });
      return;
    }

    setGuide(guideData);
    const savedProgress = loadProgress(plantId);
    if (savedProgress) {
      setProgress(savedProgress);
    } else {
      const newProgress = initializePlantProgress(plantId);
      setProgress(newProgress);
      saveProgress(newProgress);
    }
  }, [plantId]);

  if (!guide || !progress) {
    return <div>Loading...</div>;
  }

  const currentStageIndex = getCurrentStage(progress);
  const stageDates = getStageDates(progress);
  const overallProgress = Math.round(
    (progress.stages.filter(s => s.completed).length / progress.stages.length) * 100
  );

  const handleStageComplete = (stageIndex: number, completed: boolean) => {
    const updatedProgress = updateStageProgress(progress, stageIndex, { completed });
    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    if (completed) {
      toast({
        title: 'Stage Completed!',
        description: `Great job completing the ${guide.growing_guide[stageIndex].stage} stage!`,
      });
    }
  };

  const handleAddNote = (stageIndex: number, note: string) => {
    const updatedProgress = updateStageProgress(progress, stageIndex, {
      notes: note,
    });
    setProgress(updatedProgress);
    saveProgress(updatedProgress);
  };

  const handleAddPhoto = (stageIndex: number, photoUrl: string) => {
    const updatedProgress = updateStageProgress(progress, stageIndex, {
      photos: [...(progress.stages[stageIndex].photos || []), photoUrl],
    });
    setProgress(updatedProgress);
    saveProgress(updatedProgress);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{guide.common_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{guide.scientific_name}</p>
            </div>
            <Progress value={overallProgress} className="w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="guide">Growing Guide</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="notes">Notes & Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="space-y-4">
              {guide.growing_guide.map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${
                    index === currentStageIndex ? 'border-primary' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{stage.stage}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(stageDates[index].start), 'MMM d')} -{' '}
                            {format(new Date(stageDates[index].end), 'MMM d')}
                          </p>
                        </div>
                        <Checkbox
                          checked={progress.stages[index].completed}
                          onCheckedChange={(checked) => 
                            handleStageComplete(index, checked as boolean)
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {stage.instructions.map((instruction, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-primary" />
                              <p>{instruction}</p>
                            </div>
                          ))}
                        </div>

                        {stage.tools_needed && (
                          <div>
                            <h4 className="font-medium mb-2">Tools Needed</h4>
                            <div className="flex flex-wrap gap-2">
                              {stage.tools_needed.map((tool, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-muted rounded-full text-sm"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {stage.media && (
                          <div className="space-y-2">
                            {stage.media.images && (
                              <div className="grid grid-cols-2 gap-2">
                                {stage.media.images.map((image, i) => (
                                  <img
                                    key={i}
                                    src={image}
                                    alt={`${stage.stage} step ${i + 1}`}
                                    className="rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            {stage.media.video && (
                              <video
                                src={stage.media.video}
                                controls
                                className="w-full rounded-lg"
                              />
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {stage.tips?.map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                            >
                              <Lightbulb className="w-4 h-4" />
                              {tip}
                            </div>
                          ))}
                          {stage.warnings?.map((warning, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              {warning}
                            </div>
                          ))}
                          {stage.trivia?.map((trivia, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <Info className="w-4 h-4" />
                              {trivia}
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowAIChat(true)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Ask AI Assistant
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="progress">
              <div className="space-y-4">
                {progress.stages.map((stage, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {guide.growing_guide[index].stage}
                        </CardTitle>
                        <Checkbox
                          checked={stage.completed}
                          onCheckedChange={(checked) => 
                            handleStageComplete(index, checked as boolean)
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {stage.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Completed on {format(new Date(stage.completedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                      {stage.notes && (
                        <div className="mt-2">
                          <h4 className="font-medium">Notes</h4>
                          <p className="text-sm">{stage.notes}</p>
                        </div>
                      )}
                      {stage.photos && stage.photos.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Photos</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {stage.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`${stage.stage} photo ${i + 1}`}
                                className="rounded-lg"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="space-y-4">
                {progress.stages.map((stage, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {guide.growing_guide[index].stage}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <textarea
                            value={stage.notes || ''}
                            onChange={(e) => handleAddNote(index, e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            rows={3}
                            placeholder="Add your notes here..."
                          />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Photos</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {stage.photos?.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`${stage.stage} photo ${i + 1}`}
                                className="rounded-lg"
                              />
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              // Implement photo upload
                            }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Add Photo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowChat(true)}
          className="flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          Ask AI Assistant
        </Button>
      </div>

      {showChat && (
        <GrowingGuideChat
          plantId={plantId}
          currentStage={guide.growing_guide[currentStageIndex].stage}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
} 