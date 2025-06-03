import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { identifyPlant, analyzePlantHealth } from '@/lib/gemini';
import { getWeatherData, getLocation } from '@/lib/weather';
import { scheduleWateringReminder, scheduleWeatherAlert } from '@/lib/notifications';

export function ScannerView() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    health: 'healthy' | 'warning' | 'critical';
    confidence: number;
    recommendations: string[];
    diseases: string[];
    identification?: {
      species: string;
      commonNames: string[];
      careInstructions: string[];
    };
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { addPlant, updateWeatherData } = useStore();

  const startScan = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        return canvasRef.current.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const analyzePlant = async () => {
    try {
      setIsAnalyzing(true);
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      // Get plant identification and health analysis
      const [identification, healthAnalysis] = await Promise.all([
        identifyPlant(imageData),
        analyzePlantHealth(imageData),
      ]);

      // Get weather data
      const location = await getLocation();
      const weather = await getWeatherData(location.latitude, location.longitude);

      setScanResult({
        ...healthAnalysis,
        identification: {
          species: identification.species,
          commonNames: identification.commonNames,
          careInstructions: identification.careInstructions,
        },
      });

      toast.success('Plant analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze plant. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToGarden = () => {
    if (!scanResult) return;

    const imageData = captureImage();
    if (!imageData) {
      toast.error('Failed to save plant image');
      return;
    }

    const plantId = Date.now().toString();
    const nextWatering = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    addPlant({
      id: plantId,
      name: scanResult.identification?.commonNames[0] || 'New Plant',
      species: scanResult.identification?.species || 'Unknown',
      health: scanResult.health,
      lastWatered: new Date(),
      nextWatering,
      growthStage: 'seedling',
      imageUrl: imageData,
      notes: scanResult.recommendations,
      growthRecords: [],
    });

    // Schedule notifications
    scheduleWateringReminder(plantId, scanResult.identification?.commonNames[0] || 'New Plant', nextWatering);
    if (scanResult.health !== 'healthy') {
      scheduleWeatherAlert(plantId, scanResult.identification?.commonNames[0] || 'New Plant', {
        temperature: 25, // This should come from actual weather data
        condition: 'Sunny',
        humidity: 60,
      });
    }

    toast.success('Plant added to your garden!');
    router.push('/garden');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Scan Your Plant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex justify-center gap-4">
              {!isScanning ? (
                <Button onClick={startScan} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button
                    onClick={analyzePlant}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Analyze Plant
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanResult.identification && (
                <div>
                  <h4 className="font-medium mb-2">Plant Identification:</h4>
                  <p className="text-muted-foreground">
                    Species: {scanResult.identification.species}
                  </p>
                  <p className="text-muted-foreground">
                    Common Names: {scanResult.identification.commonNames.join(', ')}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {scanResult.health === 'healthy' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Health Status: {scanResult.health}
                </span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Care Instructions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {scanResult.identification?.careInstructions.map((instruction, index) => (
                    <li key={index} className="text-muted-foreground">
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {scanResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              {scanResult.diseases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-500">Detected Issues:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {scanResult.diseases.map((disease, index) => (
                      <li key={index} className="text-red-500">
                        {disease}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={addToGarden} className="w-full">
                Add to My Garden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 