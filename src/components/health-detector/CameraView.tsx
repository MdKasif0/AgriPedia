'use client';

import { useEffect, useRef, useState } from 'react';
import { CameraSettings } from '@/types/health-detector';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  settings: CameraSettings;
  isProcessing: boolean;
}

export function CameraView({ onCapture, settings, isProcessing }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: settings.camera,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check permissions.');
        setIsCameraReady(false);
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings.camera]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Camera className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-600">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {isProcessing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={captureImage}
            disabled={!isCameraReady}
          >
            <Camera className="w-6 h-6" />
          </Button>
        </div>
      )}

      {!isCameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
    </div>
  );
} 