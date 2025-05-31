import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Only used for its type, actual input is hidden
import { runFlow } from '@genkit-ai/next/client';
import { diagnosePlantHealthFlow, DiagnosePlantHealthOutputSchema } from '@/ai/flows/diagnose-plant-health-flow'; // Adjust path
import { Loader2, UploadCloud, Leaf, AlertTriangle, Sparkles, Microscope, ShieldCheck, ShieldAlert } from 'lucide-react'; // Icons

type DiagnosisResult = Zod.infer<typeof DiagnosePlantHealthOutputSchema>;

export default function PlantHealthScanner() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setDiagnosisResult(null); // Reset previous diagnosis
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDiagnose = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setDiagnosisResult(null);

    try {
      const imageDataUri = await convertFileToDataUri(selectedImage);
      const result = await runFlow(diagnosePlantHealthFlow, { imageDataUri });
      setDiagnosisResult(result);
    } catch (err: any) {
      console.error("Error running diagnosis flow:", err);
      setError(err.message || "Failed to diagnose plant health. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-center flex items-center justify-center">
          <Microscope className="w-6 h-6 mr-2" /> Plant Health Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />

        {!imagePreview && (
          <Button onClick={handleUploadClick} variant="outline" className="w-full py-8 border-dashed">
            <UploadCloud className="w-8 h-8 mr-3" />
            Upload Plant Image
          </Button>
        )}

        {imagePreview && (
          <div className="mt-4 flex flex-col items-center space-y-4">
            <img src={imagePreview} alt="Selected plant" className="max-h-64 rounded-lg shadow-md" />
            <Button onClick={handleUploadClick} variant="outline" size="sm">
              <UploadCloud className="w-4 h-4 mr-2" /> Change Image
            </Button>
          </div>
        )}

        {selectedImage && !loading && (
          <Button onClick={handleDiagnose} disabled={loading || !selectedImage} className="w-full mt-4">
            <Leaf className="w-5 h-5 mr-2" /> Diagnose Plant Health
          </Button>
        )}

        {loading && (
          <div className="flex justify-center items-center mt-6 p-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-3 text-lg">Analyzing your plant...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-semibold">Diagnosis Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {diagnosisResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-serif text-center mb-4">Diagnosis Report</h3>

            <Card className={`rounded-lg shadow-md ${diagnosisResult.isHealthy ? 'border-green-500 bg-green-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
              <CardHeader>
                <CardTitle className={`font-serif flex items-center ${diagnosisResult.isHealthy ? 'text-green-700' : 'text-amber-700'}`}>
                  {diagnosisResult.isHealthy ? <Sparkles className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                  Overall Status: {diagnosisResult.diagnosis.problem}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{diagnosisResult.diagnosis.description}</p>
                <p className="text-sm"><strong>Confidence:</strong> {(diagnosisResult.diagnosis.confidence * 100).toFixed(0)}%</p>
              </CardContent>
            </Card>

            {!diagnosisResult.isHealthy && diagnosisResult.organicTreatments && diagnosisResult.organicTreatments.length > 0 && (
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center text-green-600"><ShieldCheck className="w-5 h-5 mr-2"/> Organic Treatments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagnosisResult.organicTreatments.map((treatment, index) => (
                    <div key={`organic-${index}`}>
                      <h4 className="font-semibold">{treatment.name}</h4>
                      <p className="text-sm whitespace-pre-line">{treatment.steps}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {!diagnosisResult.isHealthy && diagnosisResult.chemicalTreatments && diagnosisResult.chemicalTreatments.length > 0 && (
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center text-orange-600"><ShieldAlert className="w-5 h-5 mr-2"/> Chemical Treatments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagnosisResult.chemicalTreatments.map((treatment, index) => (
                    <div key={`chemical-${index}`}>
                      <h4 className="font-semibold">{treatment.name}</h4>
                      <p className="text-sm whitespace-pre-line">{treatment.steps}</p>
                      {treatment.precautions && (
                        <p className="text-xs mt-1 text-amber-700 bg-amber-500/10 p-2 rounded-md"><strong >Precautions:</strong> {treatment.precautions}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
      {selectedImage && diagnosisResult && (
         <CardFooter className="flex justify-center pt-4">
            <Button onClick={() => { setSelectedImage(null); setImagePreview(null); setDiagnosisResult(null); setError(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} variant="ghost" size="sm">
                Scan Another Plant
            </Button>
         </CardFooter>
      )}
    </Card>
  );
}
