
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Camera, AlertTriangle } from 'lucide-react'; // Removed SwitchCamera as it's not used
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/app/actions';
import Loader from '@/components/ui/Loader';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // For both file and camera preview
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: initial, true: granted, false: denied/error
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup camera stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraMode) {
      const getCameraPermission = async () => {
        setHasCameraPermission(null); // Reset permission state while checking
        setError(null); // Clear previous errors
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera API is not available in this browser.');
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
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
          let message = 'Camera access was denied. Please enable camera permissions in your browser settings.';
          if (err instanceof Error && err.name === 'NotAllowedError') {
            message = 'Camera permission was denied. Please allow access in your browser settings.';
          } else if (err instanceof Error && err.name === 'NotFoundError') {
            message = 'No camera found. Ensure a camera is connected and enabled.';
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
      // Stop camera stream when switching out of camera mode
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraMode, toast]);

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
        // Navigate to the item page using the common name as slug
        // Ensure commonName is URL-friendly (lowercase, hyphens for spaces)
        router.push(`/item/${result.data.commonName.toLowerCase().replace(/\s+/g, '-')}`);
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
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
      setError('Camera not ready or permission denied.');
      return;
    }
    setIsProcessingCapture(true); 
    setPreview(null); // Clear old preview before capturing new one

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedDataUri = canvas.toDataURL('image/jpeg'); // Use JPEG for smaller size
      setPreview(capturedDataUri); 
      
      // Stop camera after capture to free resources and show preview clearly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if(videoRef.current) videoRef.current.srcObject = null;
      // setIsCameraMode(false); // Switch to file mode view to show preview and processing status; initiateImageProcessing will handle loading
      
      // Directly call processing. isLoading will be set by initiateImageProcessing.
      // The UI will naturally shift as isCameraMode is effectively false now due to stopped stream.
      // To explicitly go back to showing the "Upload an image" form after this, one would uncomment setIsCameraMode(false)
      // but that might feel abrupt if the processing takes time. For now, keep the preview visible.
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
    <div className="space-y-6 p-1 md:p-4 bg-card rounded-lg ">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => {
          setIsCameraMode(!isCameraMode);
          setPreview(null); 
          setFile(null);
          setError(null);
          setHasCameraPermission(null); // Reset permission status on mode switch
        }}>
          {isCameraMode ? <UploadCloud className="mr-2" /> : <Camera className="mr-2" />}
          {isCameraMode ? 'Upload File' : 'Use Camera'}
        </Button>
      </div>

      {isCameraMode ? (
        <div className="space-y-4">
          {hasCameraPermission === null && <Loader text="Initializing camera..." />}
          
          {hasCameraPermission === false && error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasCameraPermission && (
            <>
              <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for capture */}
              </div>
              <Button 
                onClick={handleCaptureAndProcess} 
                disabled={isLoading || isProcessingCapture || !hasCameraPermission} 
                className="w-full"
              >
                {isProcessingCapture ? <Loader text="Capturing..." size={18}/> : isLoading ? <Loader text="Identifying..." size={18}/> : <><Camera className="mr-2" /> Capture & Identify</>}
              </Button>
            </>
          )}
        </div>
      ) : (
        // File Upload Mode
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
                    capture="environment" // Suggests camera for mobile file input
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

      {preview && ( // Show preview if available, regardless of mode (useful after capture)
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Preview:</h4>
          <div className="relative w-full max-w-xs mx-auto aspect-square border rounded-md overflow-hidden bg-muted">
            <NextImage src={preview} alt="Upload preview" layout="fill" objectFit="contain" />
          </div>
        </div>
      )}

      {/* General error display and loading indicator for file mode */}
      {error && !isCameraMode && (
        <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading && !isCameraMode && !preview && ( // Show general loader if processing file without preview yet
        <div className="pt-4">
            <Loader text="Analyzing image..." />
        </div>
      )}
    </div>
  );
}

    