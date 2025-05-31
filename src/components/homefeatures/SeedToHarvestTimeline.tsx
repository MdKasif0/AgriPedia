import React, { useState } from 'react';

const SeedToHarvestTimeline: React.FC = () => {
  const [plantNameInput, setPlantNameInput] = useState('');
  const [timelinePlantName, setTimelinePlantName] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  const handleShowTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (plantNameInput.trim()) {
      setTimelinePlantName(plantNameInput.trim());
      setShowTimeline(true);
    } else {
      // Optionally, handle empty input case e.g. show an error or default text
      setTimelinePlantName('');
      setShowTimeline(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Seed-to-Harvest Timeline</h3>

      <form onSubmit={handleShowTimeline} className="mb-6 space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
        <div className="flex-grow">
          <label htmlFor="plantNameTimeline" className="sr-only">
            Plant Name
          </label>
          <input
            type="text"
            id="plantNameTimeline"
            value={plantNameInput}
            onChange={(e) => setPlantNameInput(e.target.value)}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="Enter plant name (e.g., Tomato)"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
        >
          Show Timeline
        </button>
      </form>

      {/* Timeline Placeholder */}
      {showTimeline && timelinePlantName && (
        <div>
          <h4 className="text-lg font-serif font-medium text-card-foreground mb-3">Timeline for: <span className="text-primary">{timelinePlantName}</span></h4>
          <div className="bg-muted/30 dark:bg-muted/10 border-border rounded-lg p-8 text-center">
            {/* This div would contain the actual animated progress bar */}
            <div className="w-full bg-muted rounded-full h-6 mb-2">
              <div
                className="bg-primary h-6 rounded-full flex items-center justify-center text-primary-foreground text-sm"
                style={{ width: '60%' }} // Example progress
              >
                60% - Flowering
              </div>
            </div>
            <p className="text-muted-foreground font-medium mt-2">
              Seed-to-Harvest Timeline Placeholder: {timelinePlantName}
            </p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              (Actual animated timeline will be implemented here.)
            </p>
          </div>
        </div>
      )}
      {!showTimeline && (
         <div className="bg-muted/30 dark:bg-muted/10 border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground font-medium">Enter a plant name above to see its estimated timeline.</p>
         </div>
      )}
    </div>
  );
};

export default SeedToHarvestTimeline;
