'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry
} from '@/lib/userDataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a Textarea component
import { PlusCircle, Edit3, Trash2, BookOpen, Image as ImageIcon } from 'lucide-react';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function PlantGrowthTracker() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newEntryPlantName, setNewEntryPlantName] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(getTodayDate());
  const [newEntryNotes, setNewEntryNotes] = useState('');
  const [newEntryImageUrl, setNewEntryImageUrl] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    setJournalEntries(getJournalEntries());
  }, []);

  const clearForm = () => {
    setNewEntryPlantName('');
    setNewEntryDate(getTodayDate());
    setNewEntryNotes('');
    setNewEntryImageUrl('');
    setEditingEntry(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newEntryPlantName.trim() || !newEntryDate || !newEntryNotes.trim()) {
      alert('Please fill in Plant Name, Date, and Notes.');
      return;
    }

    const entryData = {
      plantName: newEntryPlantName,
      date: newEntryDate,
      notes: newEntryNotes,
      imageUrl: newEntryImageUrl.trim() || undefined,
    };

    if (editingEntry) {
      updateJournalEntry({ ...editingEntry, ...entryData });
    } else {
      addJournalEntry(entryData);
    }
    setJournalEntries(getJournalEntries());
    clearForm();
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntryPlantName(entry.plantName);
    setNewEntryDate(entry.date);
    setNewEntryNotes(entry.notes);
    setNewEntryImageUrl(entry.imageUrl || '');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournalEntry(entryId);
      setJournalEntries(getJournalEntries());
      if (editingEntry && editingEntry.id === entryId) {
        clearForm();
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-1 text-gray-800">Plant Growth Tracker / Journal</h3>
      <p className="text-sm text-gray-600 mb-4">
        Log photos, notes, and health conditions for your plants.
      </p>

      <form onSubmit={handleFormSubmit} className="mb-6 p-3 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="text-md font-medium text-gray-700 mb-2">
          {editingEntry ? 'Edit Journal Entry' : 'Add New Journal Entry'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <Input
            type="text"
            placeholder="Plant Name (e.g., My Tomato Plant)"
            value={newEntryPlantName}
            onChange={e => setNewEntryPlantName(e.target.value)}
            className="text-sm"
            aria-label="Plant name for journal entry"
          />
          <Input
            type="date"
            value={newEntryDate}
            onChange={e => setNewEntryDate(e.target.value)}
            className="text-sm"
            aria-label="Date of journal entry"
          />
        </div>
        <Textarea
          placeholder="Notes about growth, health, watering, etc."
          value={newEntryNotes}
          onChange={e => setNewEntryNotes(e.target.value)}
          className="mb-2 text-sm min-h-[60px]"
          aria-label="Notes for journal entry"
        />
        <Input
          type="text"
          placeholder="Image URL (optional)"
          value={newEntryImageUrl}
          onChange={e => setNewEntryImageUrl(e.target.value)}
          className="mb-3 text-sm"
          aria-label="Image URL for journal entry"
        />
        <div className="flex gap-2">
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3">
            {editingEntry ? <Edit3 size={16} className="mr-1.5" /> : <PlusCircle size={16} className="mr-1.5" />}
            {editingEntry ? 'Update Entry' : 'Add Entry'}
          </Button>
          {editingEntry && (
            <Button type="button" variant="outline" onClick={clearForm} className="text-sm py-1.5 px-3">
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      <div className="flex-grow overflow-y-auto space-y-3 min-h-[200px] pr-1">
        {journalEntries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-5">
            <BookOpen size={24} className="mx-auto mb-2 text-gray-400" />
            No journal entries yet. Start tracking your plant's progress!
          </p>
        ) : (
          journalEntries.map(entry => (
            <div key={entry.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h5 className="font-semibold text-md text-gray-800">{entry.plantName}</h5>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)} className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    <Edit3 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)} className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line mb-1">{entry.notes}</p>
              {entry.imageUrl && (
                <div className="text-xs text-gray-500">
                  <ImageIcon size={12} className="inline mr-1" />
                  Image: <a href={entry.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{entry.imageUrl}</a>
                  {/* For actual image display, you'd use:
                      <img src={entry.imageUrl} alt={`Journal image for ${entry.plantName}`} className="mt-1 rounded max-h-32 w-auto" />
                      But this requires valid image URLs and error handling.
                  */}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
