import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScanLine, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function PlantHealthScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const { addPlant } = useStore();

  const handleScan = async () => {
    try {
      setIsScanning(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve(null);
        };
      });

      // Create canvas and capture image
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(videoElement, 0, 0);
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());

      // Convert image to base64
      const imageData = canvas.toDataURL('image/jpeg');

      // TODO: Send image to AI service for analysis
      // For now, simulate AI response
      const mockAnalysis = {
        health: 'healthy',
        confidence: 0.95,
        recommendations: ['Water every 3 days', 'Keep in indirect sunlight'],
        diseases: [],
      };

      // Add plant to store
      addPlant({
        id: Date.now().toString(),
        name: 'New Plant',
        species: 'Unknown',
        health: mockAnalysis.health as 'healthy' | 'warning' | 'critical',
        lastWatered: new Date(),
        nextWatering: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        growthStage: 'seedling',
        imageUrl: imageData,
        notes: mockAnalysis.recommendations,
      });

      toast.success('Plant scanned successfully!');
      router.push('/garden');
    } catch (error) {
      console.error('Scanning error:', error);
      toast.error('Failed to scan plant. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <ScanLine size={28} className="text-destructive group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">Camera-Based Plant Health Scanner</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Use image recognition to detect pests, diseases, or nutrient deficiencies. Offers diagnosis and treatment suggestions.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scan Plant
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
