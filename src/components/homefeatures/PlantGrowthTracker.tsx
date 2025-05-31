'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Assuming Card components are available
import { PlusCircle, Trash2, Image as ImageIcon, XCircle } from 'lucide-react';

// Interface now imported from userDataStore
import type { JournalEntry } from '@/lib/userDataStore';
import { getJournalEntries, addJournalEntry, removeJournalEntry, updateJournalEntry } from '@/lib/userDataStore';

const formatDateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

const PlantGrowthTracker: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEntryForm, setShowEntryForm] = useState(false);

  // Form state
  const [plantIdInput, setPlantIdInput] = useState('');
  const [entryDate, setEntryDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // For actual upload later
  const [healthCondition, setHealthCondition] = useState<JournalEntry['healthCondition']>('Healthy');

  useEffect(() => {
    setEntries(getJournalEntries()); // Load entries on mount
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file); // Store file for potential upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  };

  const resetForm = () => {
    setPlantIdInput('');
    setEntryDate(formatDateToYYYYMMDD(new Date()));
    setNotes('');
    setPhotoPreview(null);
    setPhotoFile(null);
    setHealthCondition('Healthy');
    setShowEntryForm(false);
  };

  const handleSaveEntry = () => {
    if (!plantIdInput.trim()) {
      alert('Please enter a plant name or ID.'); // Simple validation
      return;
    }
    const newEntryData: Omit<JournalEntry, 'id'> = {
      plantId: plantIdInput,
      date: entryDate,
      notes,
      photoUrl: photoPreview || undefined, // Store base64 preview for now
      healthCondition,
    };
    const savedEntry = addJournalEntry(newEntryData);
    setEntries(prevEntries => [savedEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    resetForm();
  };

  const handleDeleteEntry = (entryId: string) => {
    removeJournalEntry(entryId);
    setEntries(prevEntries => prevEntries.filter(e => e.id !== entryId));
  };

  return (
    <div className="p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Plant Growth Journal</h2>
        <Button onClick={() => setShowEntryForm(prev => !prev)}>
          <PlusCircle size={18} className="mr-2" /> {showEntryForm ? 'Cancel Entry' : 'New Journal Entry'}
        </Button>
      </div>

      {/* New Entry Form (Collapsible or Modal) */}
      {showEntryForm && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Create New Journal Entry</CardTitle>
            <CardDescription>Log the progress and health of your plant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="plantId">Plant Name/ID</Label>
              <Input id="plantId" value={plantIdInput} onChange={e => setPlantIdInput(e.target.value)} placeholder="e.g., 'Living Room Fiddle Leaf Fig' or 'Tomato_Plot_A'" className="mt-1" />
              {/* Later: Replace with a Select dropdown populated from "My Plants" */}
            </div>
            <div>
              <Label htmlFor="entryDate">Date of Entry</Label>
              <Input id="entryDate" type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observations, treatments, growth milestones..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="photo">Upload Photo</Label>
              <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1" />
              {photoPreview && (
                <div className="mt-2 relative w-32 h-32 border rounded-md overflow-hidden">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/75 text-white" onClick={() => {setPhotoPreview(null); setPhotoFile(null);}}>
                    <XCircle size={16} />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="healthCondition">Health Condition</Label>
              <Select value={healthCondition} onValueChange={(value: JournalEntry['healthCondition']) => setHealthCondition(value)}>
                <SelectTrigger id="healthCondition" className="mt-1">
                  <SelectValue placeholder="Select health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Pest Detected">Pest Detected</SelectItem>
                  <SelectItem value="Disease Suspected">Disease Suspected</SelectItem>
                  <SelectItem value="Nutrient Deficiency">Nutrient Deficiency</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSaveEntry}>Save Entry</Button>
          </CardFooter>
        </Card>
      )}

      {/* Display Existing Entries */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mt-8 mb-4">Journal History</h3>
        {entries.length === 0 && !showEntryForm && (
          <p className="text-muted-foreground">No journal entries yet. Click "New Journal Entry" to add one.</p>
        )}
        {entries.map(entry => (
          <Card key={entry.id} className="overflow-hidden">
            <div className="flex">
              {entry.photoUrl && (
                <div className="w-1/3 md:w-1/4 flex-shrink-0">
                  <img src={entry.photoUrl} alt={`Entry for ${entry.plantId}`} className="object-cover h-full w-full" />
                </div>
              )}
              <div className="flex-grow">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{entry.plantId}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 size={16} />
                    </Button>
                  </CardTitle>
                  <CardDescription>Entry Date: {entry.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  {entry.notes && <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{entry.notes}</p>}
                  {entry.healthCondition && <p className="text-sm font-medium">Health: <span className="font-normal p-1 px-1.5 text-xs rounded-sm bg-blue-100 text-blue-700">{entry.healthCondition}</span></p>}
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlantGrowthTracker;
