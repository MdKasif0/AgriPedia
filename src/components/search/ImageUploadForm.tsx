
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Camera, AlertTriangle, X, Zap, RefreshCcw, ImageUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/app/actions';
import Loader from '@/components/ui/Loader';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
import { DialogClose } from '@/components/ui/dialog'; // Assuming this is used by the parent for the 'X' button

interface ImageUploadFormProps {
  onSuccessfulScan?: () => void; // Callback to close the modal
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
        let message = 'Could not access camera. Please ensure it is connected and permissions are granted in your browser settings.';
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Camera permission was denied. Please check your browser settings.';
          } else if (err.name === 'NotFoundError') {
            message = 'No camera found on your device.';
          } else {
            message = `Could not access camera: ${err.message}.`;
          }
        }
        setError(message);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Access Issue', description: message });
      }
    };

    if (isCameraMode) {
      if (!streamRef.current && hasCameraPermission !== false) {
        getCameraPermissionInternal();
      } else if (hasCameraPermission === true && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn("Retry play failed", e));
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.pause();
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (hasCameraPermission !== false) {
         setHasCameraPermission(null);
      }
      setError(null);
    }

    // Enhanced cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
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
      setPreview(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const initiateImageProcessing = async (photoDataUri: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Aggressive stream cleanup specifically if in camera mode before AI processing
      if (isCameraMode && videoRef.current && videoRef.current.srcObject) {
        videoRef.current.pause();
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute('src');
        videoRef.current.src = ""; // Explicitly set src to empty
        videoRef.current.load(); // Tell the browser to re-evaluate sources
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const result = await processImageWithAI(photoDataUri);
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setIsProcessingCapture(false);
    }
  };

  const handleSubmitOrConfirm = async () => {
    triggerHapticFeedback();
    if (isCameraMode) { // Capture and process
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
            await initiateImageProcessing(capturedDataUri);
        } else {
            setError('Failed to capture image from camera.');
            toast({ title: 'Capture Error', description: 'Could not capture image from camera feed.', variant: 'destructive' });
            setIsProcessingCapture(false);
        }
    } else { // Process uploaded file
        if (!file && !preview) {
            setError('Please select or capture an image.');
            return;
        }
        let dataUriToProcess = preview;
        if (file && !preview) {
            const reader = new FileReader();
            reader.onload = async () => {
                dataUriToProcess = reader.result as string;
                if (dataUriToProcess) await initiateImageProcessing(dataUriToProcess);
                else { setError('Failed to read file data.'); toast({ title: 'File Read Error', variant: 'destructive' });}
            };
            reader.onerror = () => { setError('Failed to read file.'); toast({ title: 'File Read Error', variant: 'destructive' });};
            reader.readAsDataURL(file);
            return;
        }
        if (dataUriToProcess) await initiateImageProcessing(dataUriToProcess);
        else setError('No image data to process.');
    }
  };

  const triggerFileInput = () => {
    if (!isCameraMode) fileInputRef.current?.click();
    else setIsCameraMode(false); // If in camera mode, gallery button switches to upload mode
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-gray-200 relative p-0">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60">
            <X size={24} />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        {isCameraMode && (
            <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60" onClick={() => toast({ title: 'Flash control coming soon!'})}>
                <Zap size={20} />
                <span className="sr-only">Toggle Flash</span>
            </Button>
            <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60" onClick={() => toast({ title: 'Camera switch coming soon!'})}>
                <RefreshCcw size={20} />
                <span className="sr-only">Switch Camera</span>
            </Button>
            </div>
        )}
      </div>

      {/* Main View Area (Camera or Upload) */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-16 pb-32 px-4">
        {isCameraMode ? (
          <>
            <div className="relative w-full aspect-[3/4] bg-neutral-800 rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {preview && (isProcessingCapture || isLoading) && ( // Show preview only during processing after capture
                <NextImage src={preview} alt="Capture preview" fill style={{ objectFit: 'cover' }} className="absolute inset-0" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {hasCameraPermission === false && !error && (
                 <Alert variant="destructive" className="mt-4 max-w-md mx-auto bg-red-900/80 text-white border-red-700">
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <AlertTitle>Camera Permission Denied</AlertTitle>
                    <AlertDescription>Please allow camera access in your browser settings.</AlertDescription>
                </Alert>
            )}
          </>
        ) : (
          <div
            className="w-full h-full max-w-md mx-auto flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:border-green-500/70 transition-colors bg-neutral-800/50"
            onClick={() => !preview && fileInputRef.current?.click()} // Allow click only if no preview
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChange({ target: { files: [f] } as any }); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-green-500/70'); }}
            onDragEnter={(e) => e.currentTarget.classList.add('border-green-500/70')}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-green-500/70')}
          >
            {preview ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <NextImage src={preview} alt="Upload preview" fill style={{ objectFit: 'contain' }} />
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto h-16 w-16 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">Click to upload or drag &amp; drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
            <Input id="image-upload-input" name="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} ref={fileInputRef} />
          </div>
        )}
        {error && (
            <Alert variant="destructive" className="mt-4 max-w-md mx-auto bg-red-900/80 text-white border-red-700">
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>


      {/* Bottom Controls and Progress */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-full max-w-xs bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full animate-pulse" style={{ width: "75%" }}></div> {/* Simulated progress */}
            </div>
            <p className="text-sm text-green-400">Scanning...</p>
          </div>
        )}

        <div className="flex justify-around items-center">
          <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full p-3 hover:bg-black/60" onClick={triggerFileInput} aria-label={isCameraMode ? "Open Gallery" : "Upload Image"}>
            <ImageUp size={24} />
          </Button>

          {isCameraMode ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-20 h-20 bg-white rounded-full p-2 hover:bg-gray-200 shadow-2xl flex items-center justify-center disabled:opacity-50"
              onClick={handleSubmitOrConfirm}
              disabled={hasCameraPermission !== true || !videoRef.current?.srcObject || isProcessingCapture || isLoading}
              aria-label="Capture Photo"
            >
              <Camera size={36} className="text-black" />
            </Button>
          ) : (
            // In file upload mode, the central button is less prominent or could be different
             <Button
              variant="ghost"
              size="icon"
              className="w-20 h-20 bg-green-500/80 text-white rounded-full p-2 hover:bg-green-400 shadow-2xl flex items-center justify-center disabled:opacity-50"
              onClick={handleSubmitOrConfirm}
              disabled={!preview || isLoading}
              aria-label="Identify Produce"
            >
              <UploadCloud size={36} />
            </Button>
          )}

          <Button
            variant="ghost" size="icon"
            className="bg-black/40 text-white rounded-full p-3 hover:bg-black/60 disabled:opacity-50"
            onClick={handleSubmitOrConfirm}
            disabled={isLoading || (isCameraMode && (hasCameraPermission !== true || !videoRef.current?.srcObject || isProcessingCapture)) || (!isCameraMode && !preview) }
            aria-label="Confirm Identification"
          >
            <Check size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
