
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
          videoRef.current.play().catch(playError => {
            console.warn('Video play failed:', playError);
          });
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

    if (isCameraMode) {
      if (!streamRef.current && hasCameraPermission !== false) {
        getCameraPermissionInternal();
      } else if (hasCameraPermission === true && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn("Retry play failed", e));
      }
    } else {
      // Cleanup when toggling out of camera mode
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

    return () => { 
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
    };
  }, [isCameraMode, toast]); 

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { 
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

        // Aggressive cleanup if we were in camera mode, before navigation or dialog close
        if (isCameraMode && videoRef.current) {
            if (videoRef.current.srcObject) {
                videoRef.current.pause();
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            // Try to fully reset the video element's source
            videoRef.current.removeAttribute('src'); // Remove src attribute if it was ever set
            videoRef.current.src = ""; // Explicitly set src to empty
            videoRef.current.load(); // Tell the browser to re-evaluate sources (which should be none)
        }
        if (streamRef.current) { // Also clear our main stream reference
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (onSuccessfulScan) {
          onSuccessfulScan(); // This might close the dialog and unmount the component
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

    let dataUriToProcess = preview; 

    if (file && !preview) { 
      const reader = new FileReader();
      reader.onload = async () => {
        dataUriToProcess = reader.result as string;
        if (dataUriToProcess) {
          await initiateImageProcessing(dataUriToProcess);
        } else {
          setError('Failed to read file data.');
          toast({ title: 'File Read Error', description: 'Failed to read file data.', variant: 'destructive' });
        }
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        toast({ title: 'File Read Error', description: 'Failed to read file data.', variant: 'destructive' });
      };
      reader.readAsDataURL(file);
      return; 
    }
    
    if (dataUriToProcess) {
        await initiateImageProcessing(dataUriToProcess);
    } else {
        setError('No image data to process.');
    }
  };

  const handleCaptureAndProcess = async () => {
    triggerHapticFeedback();
    if (!videoRef.current || !canvasRef.current || hasCameraPermission !== true || !videoRef.current.srcObject) {
      setError('Camera not ready or permission denied.');
      if(hasCameraPermission !== true) { 
        // getCameraPermissionInternal(); // Avoid calling this directly here, let useEffect handle it based on isCameraMode
      }
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

      // Stop the stream tracks and nullify srcObject *before* async AI call (moved to initiateImageProcessing)
      // if (videoRef.current) { ... }
      // if (streamRef.current) { ... }
      
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
        }}>
          {isCameraMode ? <UploadCloud className="mr-2" /> : <Camera className="mr-2" />}
          {isCameraMode ? 'Upload File' : 'Use Camera'}
        </Button>
      </div>

      {isCameraMode ? (
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

          {(hasCameraPermission === false || error) && ( 
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>
                    {error || "Camera access was denied or no camera was found. Please check your browser settings and ensure a camera is available."}
                </AlertDescription>
              </Alert>
          )}
          {isCameraMode && hasCameraPermission === true && !error && !streamRef.current && !videoRef.current?.srcObject && ( // Condition for lost stream if camera was on
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Stream Lost</AlertTitle>
                <AlertDescription>
                    The camera stream was lost. Try toggling camera mode off and on, or ensure camera permissions are still granted.
                </AlertDescription>
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
                  if (droppedFile.size > 10 * 1024 * 1024) { 
                    setError('File is too large. Please select an image under 10MB.');
                    toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
                    setFile(null); setPreview(null); return;
                  }
                  setFile(droppedFile); setError(null); setPreview(null);
                  const reader = new FileReader();
                  reader.onloadend = () => setPreview(reader.result as string);
                  reader.readAsDataURL(droppedFile);
                }
              }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-accent'); }}
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
          {error && !isCameraMode && (
             <Alert variant="destructive" className="mt-4">
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
        </form>
      )}
    </div>
  );
}

