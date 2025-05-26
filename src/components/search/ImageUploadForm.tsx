
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Camera, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/app/actions';
import Loader from '@/components/ui/Loader';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { triggerHapticFeedback, playSound } from '@/lib/utils';

interface ImageUploadFormProps {
  onSuccessfulScan?: () => void;
}

export default function ImageUploadForm({ onSuccessfulScan }: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCameraMode, setIsCameraMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const getCameraPermissionInternal = async () => {
    setHasCameraPermission(null);
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const noApiMessage = 'Camera API is not available in this browser.';
      setError(noApiMessage);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: noApiMessage,
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let message = 'Could not access camera. Please ensure it is connected and permissions are granted in your browser settings.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Camera permission was denied. Please check your browser settings to allow camera access for this site.';
        } else if (err.name === 'NotFoundError') {
          message = 'No camera found on your device. Please ensure a camera is connected and enabled.';
        } else {
          message = `Could not access camera: ${err.message}. Try checking browser permissions or ensure no other app is using the camera.`;
        }
      }
      setError(message);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Issue',
        description: message,
      });
    }
  };

  useEffect(() => {
    if (isCameraMode) {
      // Only attempt to get permission if not already granted,
      // no stream active, and not definitively denied from a previous attempt in this session.
      if (hasCameraPermission === null && !streamRef.current) {
        getCameraPermissionInternal();
      } else if (hasCameraPermission === true && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        // Re-attach stream if permission is granted but srcObject is missing (e.g., after HMR)
        videoRef.current.srcObject = streamRef.current;
      }
    } else {
      // Cleanup when toggling out of camera mode
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Reset permission state to allow re-attempt unless it was a hard denial.
      // If it was false (hard denial), keep it false to prevent repeated prompts until mode toggle.
      if (hasCameraPermission !== false) {
          setHasCameraPermission(null); 
      }
      setError(null); // Clear previous errors when toggling out of camera mode
    }

    // This cleanup runs when isCameraMode changes (to false) or component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
      }
    };
  }, [isCameraMode, toast]); // Removed hasCameraPermission. Relies on isCameraMode and internal state checks.

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Please select an image under 10MB.');
        toast({
          title: 'File Too Large',
          description: 'Please select an image under 10MB.',
          variant: 'destructive',
        });
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setPreview(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const initiateImageProcessing = async (photoDataUri: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await processImageWithAI(photoDataUri);
      if (result.success && result.data) {
        const confidencePercentage = (result.data.confidence * 100).toFixed(0);
        toast({
          title: 'Success!',
          description: `Identified: ${result.data.commonName} (Confidence: ${confidencePercentage}%)`,
        });
        triggerHapticFeedback();
        playSound('/sounds/scan-success.mp3');
        if (onSuccessfulScan) {
          onSuccessfulScan();
        }
        router.push(`/item/${encodeURIComponent(result.data.commonName)}`);
      } else {
        setError(result.message || 'Failed to process image.');
        toast({
          title: 'Identification Failed',
          description: result.message || 'Could not identify the item from the image.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({
        title: 'Processing Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsProcessingCapture(false);
    }
  };

  const handleFileUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerHapticFeedback();
    if (!file && !preview) {
      setError('Please select or capture an image.');
      return;
    }
    if (preview) {
      initiateImageProcessing(preview);
    } else if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        initiateImageProcessing(photoDataUri);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        toast({ title: 'File Read Error', description: 'Failed to read file data.', variant: 'destructive' });
      };
    }
  };

  const handleCaptureAndProcess = async () => {
    triggerHapticFeedback();
    if (!videoRef.current || !canvasRef.current || hasCameraPermission !== true || !videoRef.current.srcObject) {
      setError('Camera not ready or permission denied.');
      return;
    }
    setIsProcessingCapture(true);
    setPreview(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedDataUri = canvas.toDataURL('image/jpeg');
      setPreview(capturedDataUri);

      // Stop the stream tracks after capture
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null; // Indicate stream is no longer active
      }
       // Detach from video element
      if (videoRef.current) videoRef.current.srcObject = null;


      await initiateImageProcessing(capturedDataUri);
    } else {
      setError('Failed to capture image from camera.');
      toast({ title: 'Capture Error', description: 'Could not capture image from camera feed.', variant: 'destructive' });
      setIsProcessingCapture(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg ">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => {
          triggerHapticFeedback();
          setIsCameraMode(!isCameraMode);
          setPreview(null);
          setFile(null);
          // setError(null); // Error is reset by useEffect when isCameraMode changes
          // setHasCameraPermission(null); // Permission is reset by useEffect
        }}>
          {isCameraMode ? <UploadCloud className="mr-2" /> : <Camera className="mr-2" />}
          {isCameraMode ? 'Upload File' : 'Use Camera'}
        </Button>
      </div>

      {isCameraMode ? (
        // Camera Mode UI
        <div className="space-y-4">
          {hasCameraPermission === null && !error && <Loader text="Initializing camera..." />}

          <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
             <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                (preview && !isProcessingCapture && !isLoading) || hasCameraPermission !== true ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              autoPlay
              playsInline
              muted
            />
            {preview && !isProcessingCapture && !isLoading && (
              <NextImage
                src={preview}
                alt="Camera capture preview"
                fill
                style={{ objectFit: 'contain' }}
                className="absolute inset-0"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{error || "Camera access was denied or no camera was found. Please check your browser settings and ensure a camera is available."}</AlertDescription>
              </Alert>
          )}

          <Button
            onClick={handleCaptureAndProcess}
            disabled={hasCameraPermission !== true || !videoRef.current?.srcObject || isProcessingCapture || isLoading}
            className="w-full"
          >
            {isProcessingCapture ? <Loader text="Capturing..." size={18}/> : isLoading ? <Loader text="Identifying..." size={18}/> : <><Camera className="mr-2" /> Capture & Identify</>}
          </Button>
        </div>
      ) : (
        // File Upload Mode UI
        <form onSubmit={handleFileUploadSubmit} className="space-y-4">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-1">
              Upload an image of a fruit or vegetable
            </label>
            <div
              className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer border-primary hover:border-accent transition-colors h-48"
              onClick={triggerFileInput}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  if (droppedFile.size > 10 * 1024 * 1024) { // 10MB limit
                    setError('File is too large. Please select an image under 10MB.');
                    toast({
                      title: 'File Too Large',
                      description: 'Please select an image under 10MB.',
                      variant: 'destructive',
                    });
                    setFile(null);
                    setPreview(null);
                    return;
                  }
                  setFile(droppedFile);
                  setError(null);
                  setPreview(null);
                  const reader = new FileReader();
                  reader.onloadend = () => setPreview(reader.result as string);
                  reader.readAsDataURL(droppedFile);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add('border-accent');
              }}
              onDragEnter={(e) => e.currentTarget.classList.add('border-accent')}
              onDragLeave={(e) => e.currentTarget.classList.remove('border-accent')}
            >
              {preview ? (
                <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-muted">
                  <NextImage src={preview} alt="Upload preview" fill style={{ objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                  <div className="flex text-sm text-muted-foreground">
                    <span className="relative rounded-md font-medium text-primary hover:text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                      Click to upload or drag and drop
                    </span>
                    <Input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>
            {file && preview && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
            {file && !preview && <p className="text-sm text-muted-foreground mt-2">Loading preview for: {file.name}</p>}
          </div>

          {(file || preview) && !isCameraMode && (
            <Button type="submit" disabled={isLoading || (!file && !preview)} className="w-full">
              {isLoading ? <Loader text="Identifying..." size={18} /> : <><UploadCloud className="mr-2 h-5 w-5" /> Identify Produce</>}
            </Button>
          )}
        </form>
      )}

      {error && !isCameraMode && ( // Only show general error if not in camera mode (camera mode has its own alert)
         <Alert variant="destructive" className="mt-4">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}
       {/* Specific error display for camera mode errors is handled within the camera mode JSX */}

      {isLoading && !isCameraMode && !preview && !file && (
        <div className="pt-4">
            <Loader text="Processing..." />
        </div>
      )}
    </div>
  );
}
