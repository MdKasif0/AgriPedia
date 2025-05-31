'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ScanLine, AlertTriangle, UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { diseasePredictionFlow } from '@/ai/flows/disease-prediction-flow'; // Path to your flow
import { runFlow } from 'genkit';
import { media } from 'genkit/media'; // For constructing the image input for the flow

// Define output schema (matching the flow's output)
interface DetectedIssue {
  issueType: 'disease' | 'pest' | 'deficiency' | 'unknown';
  name: string;
  description: string;
  confidenceScore: number;
  recommendedAction?: string;
}

const DiseasePredictionCard: React.FC = () => {
  const [prediction, setPrediction] = useState<DetectedIssue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null); // Clear previous errors
      setPrediction([]); // Clear previous predictions
    }
  };

  const handleScanImage = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction([]);

    try {
      // Convert the File object to a data URL string for the flow input
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        if (!imageDataUrl) {
          setError('Could not read image file.');
          setIsLoading(false);
          return;
        }

        // Construct the image part using genkit.media helper
        const imagePart = media.fromDataUrl(imageDataUrl);

        // TODO: Allow user to add context if desired, e.g., "tomato plant leaf"
        const result = await runFlow(diseasePredictionFlow, { image: imagePart, context: `Image of a plant part. Filename: ${selectedFile.name}` });
        setPrediction(result || []);
        if (!result || result.length === 0) {
            // setError('No specific issues detected, or the image was unclear. Try a different photo.');
        }
        setIsLoading(false); // Set loading false after processing is done
      };
      reader.onerror = () => {
        setError('Failed to read file for processing.');
        setIsLoading(false); // Set loading false on error
      };

    } catch (e: any) {
      console.error('Error predicting disease:', e);
      setError('Could not analyze image. Please try again later.');
      setPrediction([]);
      setIsLoading(false); // Also set loading false on caught error
    }
  }, [selectedFile]);

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center">
          <ScanLine size={22} className="mr-2 text-primary group-hover:animate-pulse-alt" />
          Plant Disease Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        {!previewUrl && (
          <Button
            variant="outline"
            onClick={triggerFileDialog}
            className="w-full max-w-xs py-6 border-dashed hover:border-primary transition-all duration-200"
            aria-label="Upload plant image"
          >
            <UploadCloud size={24} className="mr-2" />
            Upload Leaf/Soil Image
          </Button>
        )}

        {previewUrl && (
          <div className="mb-4 w-full flex flex-col items-center">
            <img src={previewUrl} alt="Plant preview" className="max-h-40 rounded-lg border p-1 object-contain mb-2" />
            <Button variant="link" size="sm" onClick={triggerFileDialog}>Change image</Button>
          </div>
        )}

        {selectedFile && !isLoading && (
          <Button onClick={handleScanImage} className="mt-3 w-full max-w-xs" disabled={isLoading}>
            <Sparkles size={20} className="mr-2" />
            Analyze Plant Image
          </Button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center mt-4">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="ml-2 mt-2">Analyzing image...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center text-red-500 mt-4 flex flex-col items-center">
            <AlertTriangle size={24} className="mb-1" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && prediction.length === 0 && selectedFile && !previewUrl && (
             // This state means analysis was attempted but no results and no preview (e.g. after clearing)
             <p className="text-muted-foreground mt-4 text-center">Ready to scan your image.</p>
        )}

        {!isLoading && !error && prediction.length === 0 && previewUrl && !isLoading && (
            // This state means an image is selected, analysis might have run but found nothing.
            // Check if analysis was actually run if needed by another state variable.
            // For now, assuming if predictions is empty and no error, it means nothing was found.
            <p className="text-muted-foreground mt-4 text-center">No specific issues detected from the image, or the scan hasn't been run yet for this image.</p>
        )}

        {!isLoading && !error && prediction.length > 0 && (
          <motion.div
            className="space-y-3 mt-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-sm font-semibold text-center mb-2">Analysis Results:</h4>
            <AnimatePresence>
              {prediction.map((issue, index) => (
                <motion.div
                  key={issue.name + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 border rounded-lg bg-background/50"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-md text-primary">{issue.name}</h5>
                    <Badge variant={issue.issueType === 'disease' ? 'destructive' : issue.issueType === 'pest' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                      {issue.issueType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{issue.description}</p>
                  <p className="text-xs">Confidence: <span className="font-medium">{(issue.confidenceScore * 100).toFixed(0)}%</span></p>
                  {issue.recommendedAction && <p className="text-xs mt-1">Suggestion: {issue.recommendedAction}</p>}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center justify-center">
        <p>For best results, use clear images of affected plant areas.</p>
      </CardFooter>
    </Card>
  );
};

export default DiseasePredictionCard;
