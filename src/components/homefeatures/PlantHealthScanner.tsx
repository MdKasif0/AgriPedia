'use client';

import React, { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, AlertTriangle, X, HeartPulse, RefreshCcw, ImageUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processPlantImageForDisease } from '@/app/actions';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { IdentifyPlantDiseaseFromImageOutput } from '@/ai/flows/identify-plant-disease-from-image';

export default function PlantHealthScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgressValue, setScanProgressValue] = useState(0);
  const [scanResult, setScanResult] = useState<IdentifyPlantDiseaseFromImageOutput | null>(null);

  const [isCameraMode, setIsCameraMode] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      if(hasCameraPermission !== false) {
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
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Please select an image under 10MB.');
        toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
        setFile(null);
        setPreview(null);
        setScanResult(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setScanResult(null);
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
        setScanResult(null);
        return;
      }
      setFile(droppedFile);
      setError(null);
      setScanResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
      setIsCameraMode(false);
    }
  };

  const handleImageScan = async (photoDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);
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

    if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    try {
      const result = await processPlantImageForDisease(photoDataUri);
      clearInterval(interval);
      setScanProgressValue(100);

      if (result.success && result.data) {
        setScanResult(result.data);
        toast({ title: 'Scan Complete!', description: `Analysis finished for ${result.data.diseaseName}.` });
        triggerHapticFeedback();
        playSound('/sounds/scan-success.mp3'); // Assuming this sound is appropriate
      } else {
        setError(result.message || 'Failed to process image for diseases.');
        toast({ title: 'Scan Failed', description: result.message || 'Could not analyze the plant image.', variant: 'destructive' });
      }
    } catch (err) {
      clearInterval(interval);
      setScanProgressValue(0);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
    } finally {
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
    setScanResult(null);

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
      handleImageScan(preview);
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
    setScanResult(null);
    setIsCameraMode(prevIsCameraMode => !prevIsCameraMode);
  };

  const handleShutterOrUploadClick = () => {
    triggerHapticFeedback();
    setScanResult(null);
    setError(null);
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
      } else {
        triggerFileInput();
      }
    }
  };

  const handleClearResults = () => {
    setScanResult(null);
    setPreview(null);
    setFile(null);
    setError(null);
    // If in camera mode and stream was stopped by scan, re-initialize camera
    if (isCameraMode && !streamRef.current && hasCameraPermission) {
        getCameraPermissionInternal();
    } else if (isCameraMode && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
        // If camera mode, preview was set, and stream exists but not connected to video element
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn("Retry play on clear results failed",e));
    }
  };

  // Original card structure is removed, this component now fills the grid cell
  // with the uploader and results. Title "Camera-Based Plant Health Scanner"
  // is provided by the <HomePage> grid structure.

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Camera-Based Plant Health Scanner</h3>
      <p className="text-sm text-gray-600 mb-4">
        Use image recognition to detect pests, diseases, or nutrient deficiencies.
      </p>

      {!scanResult && (
        <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-[400px] bg-gray-900 text-gray-200 rounded-md">
          {isLoading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2 p-4 bg-black/60 rounded-lg w-3/4 max-w-xs">
              <p className="text-sm text-green-400 font-semibold text-center">Scanning Plant... {scanProgressValue}%</p>
              <Progress value={scanProgressValue} className="w-full h-2.5 bg-gray-700/70 [&>div]:bg-green-500 rounded-full" />
            </div>
          )}
          {isCameraMode ? (
            <div className="absolute inset-0 bg-black z-10 rounded-md overflow-hidden">
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-4">
                      <div className="w-full h-full border-2 border-white/50 rounded-[20px] opacity-75"></div>
                  </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === null && !error && (
                   <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none">Loading camera...</div>
              )}
              {hasCameraPermission === false && error && (
                  <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[90%] bg-red-900/90 text-white border-red-700 z-30 p-3 rounded-md">
                      <AlertTriangle size={20} className="text-yellow-300 mr-2" />
                      <div>
                          <AlertTitle className="font-semibold text-sm">Camera Error</AlertTitle>
                          <AlertDescription className="text-xs">{error}</AlertDescription>
                      </div>
                  </Alert>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-2">
              <div
                className="w-full h-full max-w-md flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-400/70 transition-colors bg-neutral-800/50"
                onClick={() => !preview && triggerFileInput()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {preview ? (
                  <div className="relative w-full h-full rounded-md overflow-hidden">
                    <NextImage src={preview} alt="Upload preview" fill style={{ objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="mt-1 text-xs text-gray-400">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                  </div>
                )}
                <Input id="plant-image-upload-input" name="plant-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} ref={fileInputRef} />
                 {error && !isCameraMode && (
                    <Alert variant="destructive" className="mt-2 w-full bg-red-900/80 text-white border-red-700 text-xs p-2">
                        <AlertTriangle size={18} className="text-yellow-300" />
                        <AlertTitle>Upload Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
              </div>
            </div>
          )}

          {/* Controls outside the camera/upload view, but within the container for non-scanResult state */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-30 space-y-2 bg-gradient-to-t from-black/70 via-black/50 to-transparent rounded-b-md">
            <div className="flex justify-around items-center">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 active:scale-95 transition-transform"
                onClick={handleToggleViewMode}
                aria-label={isCameraMode ? "Switch to File Upload" : "Switch to Camera"}
                disabled={isLoading}
              >
                {isCameraMode ? <ImageUp size={24} /> : <Camera size={24} />}
              </Button>

              <Button
                variant="outline"
                className="w-14 h-14 p-0 rounded-full bg-white hover:bg-gray-300 text-black shadow-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-70 border-2 border-black/30"
                onClick={handleShutterOrUploadClick}
                disabled={isLoading || (isCameraMode && !preview && (hasCameraPermission !== true || !videoRef.current?.srcObject))}
                aria-label={isCameraMode ? (preview ? "Clear Preview" : "Capture Photo") : (preview ? "Clear Selected File" : "Upload Image")}
              >
                {isCameraMode ?
                  (preview ? <X size={28} /> : <div className="w-10 h-10 rounded-full bg-white border-[5px] border-neutral-700 group-hover:border-neutral-500 transition-colors"></div>) :
                  (preview ? <X size={28} /> : <UploadCloud size={28} />)
                }
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2.5 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-gray-500/60"
                onClick={handleConfirm}
                disabled={!preview || isLoading || isProcessingCapture}
                aria-label="Scan Plant Health"
              >
                <Check size={24} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading && !scanResult && (
        <div className="text-center p-4">
          <p className="text-gray-700">Scanning plant health...</p>
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scan Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scanResult && !isLoading && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-800">{scanResult.diseaseName}</h4>
            <Button variant="outline" size="sm" onClick={handleClearResults} className="text-sm">
              <RefreshCcw size={16} className="mr-1.5" /> Clear & Scan New
            </Button>
          </div>

          {preview && (
             <div className="mb-3 rounded-md overflow-hidden border border-gray-300 max-h-48">
                <NextImage src={preview} alt="Scanned plant" width={512} height={288} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Confidence:</strong> {(scanResult.confidence * 100).toFixed(0)}%</p>
            <p><strong>Plant Material Detected:</strong> {scanResult.isPlantMaterial ? 'Yes' : 'No'}</p>
            <p><strong>Disease Detected:</strong> {scanResult.hasDisease ? 'Yes' : 'No'}</p>
            <p><strong>Plant Part Affected:</strong> {scanResult.plantPartAffected}</p>

            <details className="pt-1">
              <summary className="font-semibold cursor-pointer hover:text-green-700">Description</summary>
              <p className="mt-1 pl-2 text-gray-600">{scanResult.briefDescription}</p>
            </details>

            <details className="pt-1">
              <summary className="font-semibold cursor-pointer hover:text-green-700">Possible Causes</summary>
              <p className="mt-1 pl-2 text-gray-600">{scanResult.possibleCauses}</p>
            </details>

            <details className="pt-1" open>
              <summary className="font-semibold cursor-pointer hover:text-green-700">Initial Recommendations</summary>
              <p className="mt-1 pl-2 text-gray-600">{scanResult.initialRecommendations}</p>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
