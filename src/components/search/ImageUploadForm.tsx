
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
  }, [isCameraMode, toast]); // hasCameraPermission is not explicitly listed, but its state is managed internally and drives calls to getCameraPermissionInternal within this effect


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

    const wasCameraMode = isCameraMode; 
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
        setIsLoading(false);
      }
    } catch (err) {
      clearInterval(interval);
      setScanProgressValue(0);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
    }
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
      setPreview(capturedDataUri); 
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

  const handleToggleViewMode = () => {
    triggerHapticFeedback();
    setPreview(null);
    setFile(null);
    setError(null);
    setIsCameraMode(prevIsCameraMode => !prevIsCameraMode);
    // The useEffect hook listening to isCameraMode handles camera stream start/stop
    // and calls getCameraPermissionInternal if needed when switching to camera mode.
  };

  const handleShutterOrUploadClick = () => {
    triggerHapticFeedback();
    if (isCameraMode) {
      if (preview) { 
        setPreview(null);
        if (videoRef.current && streamRef.current) {
          if (!videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
          }
          videoRef.current.play().catch(playError => console.warn('Retry play after clear preview failed:', playError));
        }
      } else { 
        handleCaptureAndProcess();
      }
    } else { 
      if (preview) { 
        setPreview(null);
        setFile(null);
        setError(null);
      } else { 
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

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2 p-4 bg-black/60 rounded-lg w-3/4 max-w-xs">
            <p className="text-sm text-green-400 font-semibold text-center">Scanning... {scanProgressValue}%</p>
            <Progress value={scanProgressValue} className="w-full h-2.5 bg-gray-700/70 [&>div]:bg-green-500 rounded-full" />
          </div>
        )}
        {isCameraMode ? (
          <div className="fixed inset-0 bg-black z-10">
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
                <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[90%] bg-red-900/90 text-white border-red-700 z-30 p-4 rounded-lg">
                    <AlertTriangle size={24} className="text-yellow-300 mr-2" />
                    <div>
                        <AlertTitle className="font-semibold">Camera Error</AlertTitle>
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </div>
                </Alert>
            )}
          </div>
        ) : (
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

      <div className="fixed bottom-0 left-0 right-0 p-6 z-30 space-y-3 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
        <div className="flex justify-around items-center">
          {/* Toggle View Mode Button */}
          <Button 
            variant="ghost" 
            size="lg" 
            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3.5 active:scale-95 transition-transform" 
            onClick={handleToggleViewMode} 
            aria-label={isCameraMode ? "Switch to File Upload" : "Switch to Camera"}
            disabled={isLoading}
          >
            {isCameraMode ? <ImageUp size={32} /> : <Camera size={32} />}
          </Button>

          {/* Shutter / Upload / Clear Button */}
          <Button
            variant="outline" 
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
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3.5 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-gray-500/60"
            onClick={handleConfirm}
            disabled={!preview || isLoading || isProcessingCapture} 
            aria-label="Confirm Identification"
          >
            <Check size={32} />
          </Button>
        </div>
      </div>
      <style jsx global>{`
        /* Removed dash-animate as it's not clear if it's still used. */
      `}</style>
    </div>
  );
}
