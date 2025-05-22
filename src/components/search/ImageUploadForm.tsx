
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

  useEffect(() => {
    // Cleanup stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraMode) {
      const getCameraPermission = async () => {
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
          setError(null);
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
      getCameraPermission();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Clear error/permission state when explicitly turning camera off, only if there was a previous denial/error
      if(error && hasCameraPermission === false) { 
        setHasCameraPermission(null);
        setError(null);
      }
    }
  }, [isCameraMode, toast, error, hasCameraPermission]); // Added error and hasCameraPermission to dependency array for specific reset logic

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
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
    if (!file) {
      setError('Please select an image file.');
      return;
    }
    if (preview) {
      initiateImageProcessing(preview);
    } else {
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
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
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

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if(videoRef.current) videoRef.current.srcObject = null;
      
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
          setIsCameraMode(!isCameraMode);
          setPreview(null);
          setFile(null);
          // Error and permission state are handled by the camera mode useEffect
        }}>
          {isCameraMode ? <UploadCloud className="mr-2" /> : <Camera className="mr-2" />}
          {isCameraMode ? 'Upload File' : 'Use Camera'}
        </Button>
      </div>

      {isCameraMode ? (
        <div className="space-y-4">
          {hasCameraPermission === null && !error && <Loader text="Initializing camera..." />}
          
          {hasCameraPermission === false && error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
            {preview && isCameraMode && !videoRef.current?.srcObject ? ( // Show preview if captured, and stream is stopped
                <NextImage src={preview} alt="Camera capture preview" layout="fill" objectFit="contain" />
            ) : (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          { hasCameraPermission === false && !error && ( // Show generic error if permission denied but no specific error message from API
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. You may need to adjust your browser settings.
                </AlertDescription>
              </Alert>
            )
          }
          
          <Button
            onClick={handleCaptureAndProcess}
            disabled={isLoading || isProcessingCapture || hasCameraPermission === false || (hasCameraPermission === true && !videoRef.current?.srcObject && !preview && !isProcessingCapture) }
            className="w-full"
          >
            {isProcessingCapture ? <Loader text="Capturing..." size={18}/> : isLoading ? <Loader text="Identifying..." size={18}/> : <><Camera className="mr-2" /> Capture & Identify</>}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleFileUploadSubmit} className="space-y-4">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-1">
              Upload an image of a fruit or vegetable
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer border-primary hover:border-accent transition-colors"
              onClick={triggerFileInput}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
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
              }}
            >
              <div className="space-y-1 text-center">
                {!preview && <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />}
                <div className="flex text-sm text-muted-foreground">
                  <span className="relative rounded-md font-medium text-primary hover:text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                    Click to upload or drag and drop
                  </span>
                  <Input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    accept="image/*"
                    capture="environment" 
                    className="sr-only"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
              </div>
            </div>
            {file && !preview && <p className="text-sm text-muted-foreground mt-2">Loading preview for: {file.name}</p>}
            {file && preview && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
          </div>
          
          {preview && !isCameraMode && (
            <Button type="submit" disabled={isLoading || !file || !preview} className="w-full">
              {isLoading ? <Loader text="Identifying..." size={18} /> : <><UploadCloud className="mr-2 h-5 w-5" /> Identify Produce</>}
            </Button>
          )}
        </form>
      )}

      {preview && (isLoading || isProcessingCapture || (isCameraMode && videoRef.current?.srcObject === null)) && ( // Show preview if loading/processing OR if in camera mode and stream has been stopped (capture taken)
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Preview:</h4>
          <div className="relative w-full max-w-xs mx-auto aspect-square border rounded-md overflow-hidden bg-muted">
            <NextImage src={preview} alt="Upload preview" layout="fill" objectFit="contain" />
          </div>
        </div>
      )}

      {error && (!isCameraMode || (isCameraMode && hasCameraPermission !== false && error && !isProcessingCapture)) && ( // Only show general error if not a camera permission specific error already shown
         <Alert variant="destructive" className="mt-4">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading && !isCameraMode && !preview && ( // Show loader if file is selected but preview isn't ready yet
        <div className="pt-4">
            <Loader text="Analyzing image..." />
        </div>
      )}
    </div>
  );
}
