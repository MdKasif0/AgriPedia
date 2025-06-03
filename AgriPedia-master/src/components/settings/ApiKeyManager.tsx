
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import * as UserDataStore from '@/lib/userDataStore';
import { KeyRound, Trash2 } from 'lucide-react';

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = UserDataStore.getGeminiApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setInputKey(storedKey); // Pre-fill input if key exists
    }
  }, []);

  const handleSaveKey = () => {
    UserDataStore.setGeminiApiKey(inputKey);
    setApiKey(inputKey);
    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been saved locally.',
    });
  };

  const handleClearKey = () => {
    UserDataStore.removeGeminiApiKey();
    setApiKey('');
    setInputKey('');
    toast({
      title: 'API Key Cleared',
      description: 'Your Gemini API key has been removed from local storage.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="apiKeyInput" className="text-sm font-medium text-sidebar-foreground">Gemini API Key</Label>
      <div className="flex items-center gap-2">
        <Input
          id="apiKeyInput"
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter your API key"
          className="bg-input border-sidebar-border text-sidebar-foreground"
        />
        <Button onClick={handleSaveKey} size="sm" variant="default" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
          Save
        </Button>
      </div>
      {apiKey && (
        <Button onClick={handleClearKey} size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 w-full justify-start gap-2">
          <Trash2 size={14}/> Clear Saved Key
        </Button>
      )}
      <Alert variant="default" className="mt-2 bg-sidebar-accent/10 border-sidebar-accent/30 text-sidebar-foreground">
        <KeyRound className="h-4 w-4 text-sidebar-accent" />
        <AlertTitle className="text-xs font-semibold">Note on API Key Usage</AlertTitle>
        <AlertDescription className="text-xs">
          Your API key is stored securely in your browser&apos;s local storage and is NOT sent to our servers.
          Currently, core AI features (like image recognition and AgriPedia Tips) use a server-configured API key.
          This input is for potential future client-side AI features or personal use.
        </AlertDescription>
      </Alert>
    </div>
  );
}
