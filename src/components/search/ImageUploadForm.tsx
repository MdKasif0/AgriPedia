
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
}

export default function ImageUploadForm({ onSuccessfulScan }: ImageUploadFormProps) {
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

  const handleGalleryClick = () => {
    triggerHapticFeedback();
    if (isCameraMode) {
      setIsCameraMode(false); // Switch to file upload mode
      setPreview(null);
      setFile(null);
      // No need to click fileInputRef here, user will interact with the upload UI
    } else {
       triggerFileInput(); // If already in file mode, open file picker
    }
  };

  const handleShutterOrUploadClick = () => {
    triggerHapticFeedback();
    if (isCameraMode) {
      handleCaptureAndProcess(); // Changed from handleCapture to handleCaptureAndProcess
    } else { // In file upload mode
      if(preview){ // If there's a preview from a file, switch to camera mode
        setIsCameraMode(true);
        setPreview(null);
        setFile(null);
      } else { // If no file preview, trigger file input
        triggerFileInput();
      }
    }
  };


  return (
    <div className="h-full w-full bg-black text-gray-200 relative flex flex-col p-0">
      {/* Top Controls - Close button removed */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        {isCameraMode && hasCameraPermission === true && (
          <>
            <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 active:scale-95 transition-transform" onClick={() => toast({ title: 'Flash control coming soon!'})}>
              <Zap size={20} />
              <span className="sr-only">Toggle Flash</span>
            </Button>
            <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 active:scale-95 transition-transform" onClick={() => toast({ title: 'Camera switch coming soon!'})}>
              <RefreshCcw size={20} />
              <span className="sr-only">Switch Camera</span>
            </Button>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-16 pb-32 px-4">
        {isCameraMode ? (
          <div className="relative w-full aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto">
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
                 <div className="absolute inset-0 flex items-center justify-center text-white/80">Loading camera...</div>
            )}
            {hasCameraPermission === false && error && (
                 <Alert variant="destructive" className="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-red-900/80 text-white border-red-700 z-30">
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {hasCameraPermission === true && !videoRef.current?.srcObject && !preview && !error && (
                <Alert variant="destructive" className="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-blue-900/80 text-white border-blue-700 z-30">
                    <Camera className="h-4 w-4 text-blue-300" />
                    <AlertTitle>Camera Initializing</AlertTitle>
                    <AlertDescription>Please wait or ensure camera is not in use by another app.</AlertDescription>
                </Alert>
            )}
          </div>
        ) : ( 
          <div
            className="w-full h-full max-w-md mx-auto flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:border-green-400/70 transition-colors bg-neutral-800/50"
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
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <AlertTitle>Upload Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-3">
        {isLoading && (
          <div className="flex flex-col items-center space-y-1 mb-2">
            <p className="text-sm text-green-400 font-medium">Scanning... {scanProgressValue}%</p>
            <Progress value={scanProgressValue} className="w-full max-w-xs h-2 bg-gray-700 [&>div]:bg-green-500" />
          </div>
        )}

        <div className="flex justify-around items-center">
          <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full p-3 hover:bg-black/70 active:scale-95 transition-transform" onClick={handleGalleryClick} aria-label="Open Gallery">
            <ImageUp size={24} />
          </Button>

          <Button
            variant="ghost"
            className="w-16 h-16 p-0 rounded-full bg-white hover:bg-gray-200 shadow-2xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
            onClick={handleShutterOrUploadClick}
            disabled={isLoading || (isCameraMode && (hasCameraPermission !== true || !videoRef.current?.srcObject)) }
            aria-label={isCameraMode ? "Capture Photo" : (preview ? "Switch to Camera" : "Upload Image")}
          >
            {isCameraMode ? 
              <div className="w-12 h-12 rounded-full bg-white border-4 border-neutral-700 group-hover:border-neutral-500 transition-colors"></div> :
              (preview ? <Camera size={28} className="text-black" /> : <UploadCloud size={28} className="text-black" />)
            }
          </Button>

          <Button
            variant="ghost" size="icon"
            className="bg-black/50 text-white rounded-full p-3 hover:bg-black/70 active:scale-95 transition-transform disabled:opacity-60"
            onClick={handleConfirm}
            disabled={!preview || isLoading || isProcessingCapture}
            aria-label="Confirm Identification"
          >
            <Check size={24} />
          </Button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes dash-animate {
          to {
            stroke-dashoffset: -20; 
          }
        }
      `}</style>
    </div>
  );
}
