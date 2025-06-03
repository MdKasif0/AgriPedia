'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Flash, RotateCcw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraSettings, HealthDetection, ScanResult } from '@/types/health-detector';
import { CameraView } from './CameraView';
import { ScanResultCard } from './ScanResultCard';
import { ScanHistory } from './ScanHistory';

export function PlantHealthDetector() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    mode: 'whole_plant',
    flash: false,
    camera: 'rear',
    autoCrop: true,
  });
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // This would typically call your AI service
      const mockDetection: HealthDetection = {
        status: 'warning',
        issue: 'nutrient_deficiency',
        confidence: 0.87,
        description: 'Possible nitrogen deficiency detected in lower leaves',
        affectedAreas: [
          { x: 100, y: 150, width: 200, height: 100 }
        ],
        recommendations: {
          immediate: [
            'Apply balanced fertilizer',
            'Check soil pH levels'
          ],
          preventive: [
            'Maintain regular fertilization schedule',
            'Monitor leaf color changes'
          ]
        },
        relatedArticles: [
          'Understanding Plant Nutrient Deficiencies',
          'How to Test Soil pH'
        ]
      };

      const newScan: ScanResult = {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: imageData,
        detection: mockDetection,
        isProcessed: true
      };

      setScanResult(newScan);
      setScanHistory(prev => [newScan, ...prev]);
    } catch (error) {
      console.error('Error processing scan:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleCapture(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeedback = (scanId: string, isCorrect: boolean, suggestedIssue?: string) => {
    setScanHistory(prev => prev.map(scan => 
      scan.id === scanId
        ? {
            ...scan,
            userFeedback: {
              isCorrect,
              suggestedIssue: suggestedIssue as any,
            }
          }
        : scan
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plant Health Scanner</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCameraSettings(prev => ({
              ...prev,
              flash: !prev.flash
            }))}
          >
            <Flash className="w-4 h-4 mr-2" />
            {cameraSettings.flash ? 'Flash On' : 'Flash Off'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCameraSettings(prev => ({
              ...prev,
              camera: prev.camera === 'front' ? 'rear' : 'front'
            }))}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Switch Camera
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList>
          <TabsTrigger value="scan">Scan Plant</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={cameraSettings.mode === 'whole_plant' ? 'default' : 'outline'}
                    onClick={() => setCameraSettings(prev => ({
                      ...prev,
                      mode: 'whole_plant'
                    }))}
                    className="flex-1"
                  >
                    Whole Plant
                  </Button>
                  <Button
                    variant={cameraSettings.mode === 'leaf' ? 'default' : 'outline'}
                    onClick={() => setCameraSettings(prev => ({
                      ...prev,
                      mode: 'leaf'
                    }))}
                    className="flex-1"
                  >
                    Leaf Close-up
                  </Button>
                </div>

                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <CameraView
                    onCapture={handleCapture}
                    settings={cameraSettings}
                    isProcessing={isProcessing}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleUpload(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </Card>

            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ScanResultCard
                    result={scanResult}
                    onFeedback={handleFeedback}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <ScanHistory
            scans={scanHistory}
            onFeedback={handleFeedback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 