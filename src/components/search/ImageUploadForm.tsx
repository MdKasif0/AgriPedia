'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithAI } from '@/app/actions';
import Loader from '@/components/ui/Loader';
import NextImage from 'next/image';

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const result = await processImageWithAI(photoDataUri);
        if (result.success && result.data) {
          toast({
            title: 'Success!',
            description: `Identified: ${result.data.commonName}`,
          });
          // Navigate to item page using common name as slug
          router.push(`/item/${result.data.commonName.toLowerCase().replace(/\s+/g, '-')}`);
        } else {
          setError(result.message || 'Failed to process image.');
          toast({
            title: 'Error',
            description: result.message || 'Failed to process image.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
       toast({
        title: 'Error',
        description: 'Failed to read file.',
        variant: 'destructive',
      });
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-1">
          Upload an image of a fruit or vegetable
        </label>
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer border-primary hover:border-accent transition-colors"
          onClick={triggerFileInput}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
                setFile(droppedFile);
                setError(null);
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(droppedFile);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-1 text-center">
            {preview ? (
              <NextImage src={preview} alt="Preview" width={200} height={200} className="mx-auto h-32 w-32 object-cover rounded-md" />
            ) : (
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
            )}
            <div className="flex text-sm text-muted-foreground">
              <span className="relative rounded-md font-medium text-primary hover:text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                Click to upload or drag and drop
              </span>
              <Input
                id="image-upload"
                name="image-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Button type="submit" disabled={isLoading || !file} className="w-full" variant="default">
          {isLoading ? <Loader text="Analyzing..." size={18} /> : <><UploadCloud className="mr-2 h-5 w-5" /> Identify Produce</>}
        </Button>
      </div>
    </form>
  );
}
