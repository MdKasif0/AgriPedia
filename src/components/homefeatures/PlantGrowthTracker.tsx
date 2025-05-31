import React, { useState } from 'react';

const PlantGrowthTracker: React.FC = () => {
  const [plantName, setPlantName] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null); // Placeholder for file state
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      // For now, we just store the file object. No actual upload will occur.
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setConfirmationMessage('Please enter a plant name.');
      return;
    }
    // In a real app, you would send this data to a backend or state management
    setConfirmationMessage(`Progress logged for ${plantName}!`);
    setPlantName('');
    setNotes('');
    setPhoto(null);
    // Clear the file input visually (though the actual file object is already null)
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Hide message after a few seconds
    setTimeout(() => setConfirmationMessage(''), 3000);
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Plant Growth Tracker</h3>

      {/* Log Progress Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="plantName" className="block text-sm font-medium text-muted-foreground mb-1">
            Plant Name
          </label>
          <input
            type="text"
            id="plantName"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., My Rose Bush"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., Noticed new buds today, leaves look healthy."
          />
        </div>

        <div>
          <label htmlFor="photo-upload" className="block text-sm font-medium text-muted-foreground mb-1">
            Upload Photo (Optional)
          </label>
          <input
            type="file"
            id="photo-upload"
            onChange={handlePhotoChange}
            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-primary/30 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
          />
           <p className="text-xs text-muted-foreground/80 mt-1">Photo upload is for UI demonstration only.</p>
        </div>

        <button
          type="submit"
          className="group w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.02] flex items-center justify-center"
        >
          {/* Sprout SVG Icon - Hidden by default, shown and animates on button hover */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:animate-sprout-grow transition-all duration-300">
            <path d="M10.75 16.75a.75.75 0 00-1.5 0v-2.438c0-.396-.19-.762-.506-.992l-.001-.001-2.17-1.447a.75.75 0 10-.848 1.272l1.415.943-.67 2.233a.75.75 0 001.416.424l.92-.307.92.307a.75.75 0 001.416-.424l-.67-2.233 1.415-.943a.75.75 0 00-.848-1.272l-2.17 1.447-.001.001a1.753 1.753 0 01-.506.992V16.75zM9 4.5H3.75a.75.75 0 000 1.5H9a.75.75 0 000-1.5zM11.25 6H9.372a.75.75 0 000 1.5h1.878a.75.75 0 000-1.5zM6 7.5H3.75a.75.75 0 000 1.5H6a.75.75 0 000-1.5zM11.25 9H7.872a.75.75 0 000 1.5h3.378a.75.75 0 000-1.5z" />
          </svg>
          <span>Log Progress</span>
        </button>
        {confirmationMessage && (
          <p className={`mt-2 text-sm ${confirmationMessage.startsWith('Please enter') ? 'text-destructive' : 'text-primary'}`}>
            {confirmationMessage}
          </p>
        )}
      </form>


      {/* Timeline Placeholder */}
      <div>
        <h4 className="text-lg font-serif font-medium text-card-foreground mb-3">Growth Timeline:</h4>
        <div className="bg-muted/30 dark:bg-muted/10 border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground font-medium">Plant Progress Timeline Placeholder</p>
          <p className="text-sm text-muted-foreground/80 mt-1">A visual timeline of logged progress will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default PlantGrowthTracker;
