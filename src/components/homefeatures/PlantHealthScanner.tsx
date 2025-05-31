'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, ScanLine, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ScanResult {
  diagnosis: string;
  treatmentSuggestions: string[];
  error?: string | null;
  isLoading: boolean;
}

const PlantHealthScanner: React.FC = () => {
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // For actual processing later
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
        setScanResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedImagePreview(null);
      setImageFile(null);
    }
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleScanPlantImage = () => {
    if (!imageFile) {
      setScanResult({
        diagnosis: '',
        treatmentSuggestions: [],
        error: 'Please upload an image first.',
        isLoading: false,
      });
      return;
    }

    setScanResult({ diagnosis: '', treatmentSuggestions: [], isLoading: true, error: null });

    // Simulate API call / processing delay
    setTimeout(() => {
      // Replace with actual API call and result handling later
      // For now, simulate a successful scan or an error
      const success = Math.random() > 0.3; // Simulate 70% success rate
      if (success) {
        setScanResult({
          diagnosis: 'Appears to be a mild case of Powdery Mildew.',
          treatmentSuggestions: [
            'Improve air circulation around the plant.',
            'Apply a fungicide (e.g., neem oil or potassium bicarbonate solution).',
            'Remove severely affected leaves.',
            'Avoid overhead watering.',
          ],
          isLoading: false,
          error: null,
        });
      } else {
        setScanResult({
          diagnosis: '',
          treatmentSuggestions: [],
          error: 'Could not identify the issue. Please try a clearer image or different angle.',
          isLoading: false,
        });
      }
    }, 2000);
  };

  const clearUpload = () => {
    setUploadedImagePreview(null);
    setImageFile(null);
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-primary">Plant Health Scanner</CardTitle>
        <CardDescription>Upload an image of your plant to detect potential issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="plant-image-upload" className="text-sm font-medium">Upload Plant Image</Label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-muted hover:border-primary rounded-md cursor-pointer"
            onClick={handleTriggerFileUpload}
          >
            <div className="space-y-1 text-center">
              {uploadedImagePreview ? (
                <div className="relative group w-full max-w-xs mx-auto">
                  <img src={uploadedImagePreview} alt="Uploaded plant" className="mx-auto h-48 w-auto rounded-md object-contain" />
                   <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); clearUpload(); }}
                    aria-label="Remove image"
                  >
                    <XCircle size={20} />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
          <Input
            id="plant-image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="sr-only" // Visually hidden, triggered by the div
          />
        </div>

        {uploadedImagePreview && (
          <Button onClick={handleScanPlantImage} disabled={scanResult?.isLoading} className="w-full">
            <ScanLine size={18} className="mr-2" />
            {scanResult?.isLoading ? 'Scanning...' : 'Scan Plant Image'}
          </Button>
        )}

        {scanResult && !scanResult.isLoading && (
          <div className="pt-4 mt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Scan Results:</h3>
            {scanResult.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-start">
                <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{scanResult.error}</p>
              </div>
            )}
            {!scanResult.error && scanResult.diagnosis && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-md">Diagnosis:</h4>
                  <p className="text-muted-foreground p-2 bg-muted/50 rounded-md">{scanResult.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium text-md">Treatment Suggestions:</h4>
                  {scanResult.treatmentSuggestions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground p-2 bg-muted/50 rounded-md">
                      {scanResult.treatmentSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-muted-foreground p-2 bg-muted/50 rounded-md">No specific treatment suggestions available.</p>
                  )}
                </div>
                 <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-700 flex items-start">
                  <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-xs">Scan completed. Remember, this is a preliminary analysis. For critical issues, consult with a local expert.</p>
                </div>
              </div>
            )}
          </div>
        )}
         {scanResult && scanResult.isLoading && (
            <div className="pt-4 mt-4 border-t text-center">
                <ScanLine size={24} className="animate-pulse text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Analyzing image, please wait...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlantHealthScanner;
