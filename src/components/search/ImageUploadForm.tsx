
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Camera, AlertTriangle, X, Zap, RefreshCcw, ImageUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/app/actions';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
// DialogClose removed as the X button is being removed
import { Progress } from '@/components/ui/progress';

interface ImageUploadFormProps {
  onSuccessfulScan?: () => void;
  onCloseDialog?: () => void;
}

export default function ImageUploadForm({ onSuccessfulScan, onCloseDialog }: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgressValue, setScanProgressValue] = useState(0);

  const [isCameraMode, setIsCameraMode] = useState(true);
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
      toast({ variant: 'destructive', title: 'Camera Not Supported', description: noApiMessage });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(playError => console.warn('Video play failed:', playError));
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let message = 'Could not access camera. Please ensure it is connected and permissions are granted.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Camera permission was denied. Please check your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'No camera found on your device.';
        } else {
          message = `Could not access camera: ${err.message}.`;
        }
      }
      setError(message);
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Access Issue', description: message, duration: 5000 });
    }
  };

  useEffect(() => {
    let localStreamRef: MediaStream | null = null;
    if (isCameraMode) {
      if (!streamRef.current && hasCameraPermission !== false) {
        getCameraPermissionInternal();
      } else if (hasCameraPermission === true && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn("Retry play failed", e));
      }
      localStreamRef = streamRef.current;
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if(hasCameraPermission !== false) { // Don't reset if definitively denied
        setHasCameraPermission(null);
      }
      setError(null);
    }

    return () => {
      if (localStreamRef) {
        localStreamRef.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraMode, toast]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File is too large. Please select an image under 10MB.');
        toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-green-500');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-green-500');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-green-500');
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
       if (droppedFile.size > 10 * 1024 * 1024) { 
        setError('File is too large. Please select an image under 10MB.');
        toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(droppedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
      setIsCameraMode(false); 
    }
  };

  const initiateImageProcessing = async (photoDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setScanProgressValue(0);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 95) { 
        clearInterval(interval);
        setScanProgressValue(95);
      } else {
        setScanProgressValue(progress);
      }
    }, 300);

    // Aggressive cleanup specific to this processing flow
    const wasCameraMode = isCameraMode; // Capture state before potential changes
    if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute('src'); 
        videoRef.current.src = "";
        videoRef.current.load();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }


    try {
      const result = await processImageWithAI(photoDataUri);
      clearInterval(interval); 
      setScanProgressValue(100);

      if (result.success && result.data) {
        const confidencePercentage = (result.data.confidence * 100).toFixed(0);
        toast({ title: 'Success!', description: `Identified: ${result.data.commonName} (Confidence: ${confidencePercentage}%)` });
        triggerHapticFeedback();
        playSound('/sounds/scan-success.mp3');
        
        if (onSuccessfulScan) onSuccessfulScan();
        router.push(`/item/${encodeURIComponent(result.data.commonName)}`);
      } else {
        setError(result.message || 'Failed to process image.');
        toast({ title: 'Identification Failed', description: result.message || 'Could not identify the item from the image.', variant: 'destructive' });
        setIsLoading(false); // Re-enable UI if error
      }
    } catch (err) {
      clearInterval(interval);
      setScanProgressValue(0);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
      setIsLoading(false); // Re-enable UI if error
    }
     //setIsProcessingCapture(false); // Reset this state after processing
  };
  
  const handleCaptureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || hasCameraPermission !== true || !videoRef.current.srcObject) {
      setError('Camera not ready or permission denied.');
      toast({ title: 'Camera Issue', description: 'Camera not ready or permission denied.', variant: 'destructive' });
      return;
    }
    triggerHapticFeedback();
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
      setPreview(capturedDataUri); // Set preview for confirmation step
      // No longer calls initiateImageProcessing directly
    } else {
      setError('Failed to capture image from camera.');
      toast({ title: 'Capture Error', description: 'Could not capture image from camera feed.', variant: 'destructive' });
    }
    setIsProcessingCapture(false);
  };

  const handleConfirm = () => {
    if (preview && !isLoading) {
      triggerHapticFeedback();
      initiateImageProcessing(preview);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleActivateCameraMode = () => {
    triggerHapticFeedback();
    setIsCameraMode(true);
    setFile(null);
    setPreview(null);
    setError(null);
    // Ensure camera stream is initialized if permission was previously granted
    // and not currently active (e.g., if user switched from file upload)
    if (hasCameraPermission === true && !streamRef.current) {
        getCameraPermissionInternal(); // This will attempt to re-initialize
    }
  };

  const handleShutterOrUploadClick = () => {
    triggerHapticFeedback();
    if (isCameraMode) {
      if (preview) { // If in camera mode and there's a preview (Clear Preview action)
        setPreview(null);
        // Ensure camera feed is visible and active
        if (videoRef.current && streamRef.current) {
          if (!videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
          }
          videoRef.current.play().catch(playError => console.warn('Retry play after clear preview failed:', playError));
        }
      } else { // If in camera mode and no preview (Capture Photo action)
        handleCaptureAndProcess();
      }
    } else { // In file upload mode
      if (preview) { // If there's a preview from a file (Clear Selected File action)
        setPreview(null);
        setFile(null);
        setError(null);
      } else { // If no file preview (Upload Image action)
        triggerFileInput();
      }
    }
  };


  return (
    <div className="h-full w-full bg-black text-gray-200 relative flex flex-col p-0">
      {onCloseDialog && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            triggerHapticFeedback();
            onCloseDialog();
          }}
          className="absolute top-4 left-4 z-50 bg-black/50 text-white hover:bg-black/70 p-2.5 rounded-full"
          aria-label="Close"
        >
          <X size={32} />
        </Button>
      )}
      {/* Top Controls (Flash, Switch Camera) removed */}

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2 p-4 bg-black/60 rounded-lg w-3/4 max-w-xs">
            <p className="text-sm text-green-400 font-semibold text-center">Scanning... {scanProgressValue}%</p>
            <Progress value={scanProgressValue} className="w-full h-2.5 bg-gray-700/70 [&>div]:bg-green-500 rounded-full" />
          </div>
        )}
        {/* This div's padding (pt-16 pb-32 px-4) is removed to allow full screen for camera */}
        {/* It will still center the file upload UI */}
        {isCameraMode ? (
          // Camera View Container - Modified for full-screen
          <div className="fixed inset-0 bg-black z-10"> {/* Full screen */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-opacity duration-300 ${preview && !isProcessingCapture && !isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              autoPlay
              playsInline
              muted
            />
            {preview && !isProcessingCapture && !isLoading && (
              <NextImage src={preview} alt="Capture preview" fill style={{ objectFit: 'cover' }} className="absolute inset-0 transition-opacity duration-300 opacity-100" />
            )}
            {!preview && hasCameraPermission === true && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-8">
                    <div className="w-full h-full border-2 border-white/50 rounded-[28px] opacity-75"></div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === null && !error && (
                 <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none">Loading camera...</div>
            )}
            {hasCameraPermission === false && error && (
                 // Error alert for camera, positioned within the full-screen view if needed, or rely on toast.
                 // For now, keeping it simple, toast is primary feedback for this error.
                 // Consider adding a small, non-intrusive error display here if toasts are missed.
                 // The main controls overlay will be on top, so this needs to be positioned carefully if re-enabled.
                <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[90%] bg-red-900/90 text-white border-red-700 z-30 p-4 rounded-lg">
                    <AlertTriangle size={24} className="text-yellow-300 mr-2" />
                    <div>
                        <AlertTitle className="font-semibold">Camera Error</AlertTitle>
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </div>
                </Alert>
            )}
            {/* Removed the "Camera Initializing" alert to simplify UI, relying on "Loading camera..." and error states. */}
          </div>
        ) : (
          // File Upload UI - Centered by parent's flex properties
          // Added padding here since parent's padding was removed
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <div
              className="w-full h-full max-w-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:border-green-400/70 transition-colors bg-neutral-800/50"
              onClick={() => !preview && triggerFileInput()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {preview ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <NextImage src={preview} alt="Upload preview" fill style={{ objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto h-16 w-16 text-gray-500" />
                  <p className="mt-2 text-sm text-gray-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
              <Input id="image-upload-input" name="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} ref={fileInputRef} />
               {error && !isCameraMode && (
                  <Alert variant="destructive" className="mt-4 w-full bg-red-900/80 text-white border-red-700">
                      <AlertTriangle size={24} className="text-yellow-300" />
                      <AlertTitle>Upload Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay - This is now a direct child of the main component div, always present */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-30 space-y-3 bg-gradient-to-t from-black/70 via-black/50 to-transparent"> {/* Increased z-index and added background */}
        <div className="flex justify-around items-center">
          {/* Switch to Camera Button */}
          <Button 
            variant="ghost" 
            size="lg" // Larger touch target
            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3.5 active:scale-95 transition-transform" 
            onClick={handleActivateCameraMode} 
            aria-label="Open Camera"
            disabled={isLoading}
          >
            <Camera size={32} />
          </Button>

          {/* Shutter / Upload / Switch to File Upload Button */}
          <Button
            variant="outline" // More prominent
            className="w-18 h-18 p-0 rounded-full bg-white hover:bg-gray-300 text-black shadow-2xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-70 border-2 border-black/30"
            onClick={handleShutterOrUploadClick}
            disabled={isLoading || (isCameraMode && !preview && (hasCameraPermission !== true || !videoRef.current?.srcObject))}
            aria-label={isCameraMode ? (preview ? "Clear Preview" : "Capture Photo") : (preview ? "Clear Selected File" : "Upload Image")}
          >
            {isCameraMode ? 
              (preview ? <X size={36} /> : <div className="w-14 h-14 rounded-full bg-white border-[6px] border-neutral-700 group-hover:border-neutral-500 transition-colors"></div>) :
              (preview ? <X size={36} /> : <UploadCloud size={36} />) 
            }
          </Button>

          {/* Confirm Button */}
          <Button 
            variant="ghost" 
            size="lg" // Larger touch target
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3.5 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-gray-500/60"
            onClick={handleConfirm}
            disabled={!preview || isLoading || isProcessingCapture} // isProcessingCapture might be redundant if isLoading is true
            aria-label="Confirm Identification"
          >
            <Check size={32} />
          </Button>
        </div>
      </div>
      {/* Global style for animation can remain if used elsewhere, or be removed if specific to a removed element */}
      <style jsx global>{`
        /* Removed dash-animate as it's not clear if it's still used. */
        /* If it was for the dashed border on upload, Tailwind handles that without animation. */
      `}</style>
    </div>
  );
}
