'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'; // Assuming Dialog components are available
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming ScrollArea is available

interface GuideContent {
  title: string;
  planting: string;
  watering: string;
  spacing: string;
  fertilizing: string;
  harvesting: string;
  tags: string[];
}

interface GuideListItem {
  id: string;
  title: string;
  shortDescription: string;
  content: GuideContent; // Full content for the detailed view
}

// Sample Data - Replace with actual data source later
const sampleGuides: GuideListItem[] = [
  {
    id: 'tomato-indoors',
    title: 'Growing Tomatoes Indoors',
    shortDescription: 'A comprehensive guide to successfully growing tomatoes inside your home.',
    content: {
      title: 'Growing Tomatoes Indoors: A Complete Guide',
      planting: 'Start seeds in small pots 6-8 weeks before the last expected frost. Transplant to larger containers (at least 5 gallons) when seedlings are 6-8 inches tall. Use good quality potting mix.',
      watering: 'Water deeply when the top inch of soil feels dry. Avoid overwatering. Aim for consistent moisture. Consider self-watering containers.',
      spacing: 'One plant per 5-gallon container. If using grow lights, ensure leaves do not touch the bulbs.',
      fertilizing: 'Feed with a balanced liquid fertilizer every 2-3 weeks once fruits start to set. Follow product instructions.',
      harvesting: 'Harvest tomatoes when they are fully colored and slightly soft to the touch. This usually occurs 60-85 days after transplanting, depending on the variety.',
      tags: ['Indoor', 'Container Gardening'],
    },
  },
  {
    id: 'herb-garden-basics',
    title: 'Basic Herb Gardening for Beginners',
    shortDescription: 'Learn the fundamentals of starting your own herb garden, indoors or outdoors.',
    content: {
      title: 'Basic Herb Gardening for Beginners: From Seed to Seasoning',
      planting: 'Most herbs can be started from seeds or young plants. Choose a sunny spot (6+ hours of sun). Use well-draining soil. For indoor herbs, place near a sunny window.',
      watering: 'Water when the top inch of soil is dry. Herbs generally prefer less water than vegetables. Ensure good drainage to prevent root rot.',
      spacing: 'Varies by herb. Check seed packets or plant tags. Generally, allow enough space for mature growth to ensure good air circulation.',
      fertilizing: 'Herbs typically do not require heavy fertilization. A light feeding with an organic fertilizer once or twice during the growing season is usually sufficient.',
      harvesting: 'Harvest herbs regularly to encourage new growth. Snip leaves or stems as needed. Avoid taking more than one-third of the plant at a time.',
      tags: ['Beginner', 'Indoor', 'Outdoor', 'Herbs'],
    },
  },
  {
    id: 'lettuce-hydroponics',
    title: 'Hydroponic Lettuce Cultivation',
    shortDescription: 'Explore growing lettuce using hydroponic methods for faster growth and higher yields.',
    content: {
      title: 'Hydroponic Lettuce Cultivation: A Soil-Free Approach',
      planting: 'Start seeds in rockwool cubes or similar inert media. Once roots emerge, transfer to your hydroponic system (e.g., Kratky, NFT, DWC).',
      watering: 'Maintain the nutrient solution level and concentration as per your system\'s requirements. Monitor pH and EC regularly.',
      spacing: 'Allow 6-8 inches between plants for most lettuce varieties in a hydroponic setup.',
      fertilizing: 'Use a hydroponic-specific nutrient solution formulated for leafy greens. Follow the manufacturer\'s mixing instructions carefully.',
      harvesting: 'Harvest outer leaves as needed (cut-and-come-again method) or harvest the entire head once it reaches desired size. Typically 4-6 weeks after transplanting.',
      tags: ['Hydroponics', 'Leafy Greens', 'Advanced'],
    },
  }
];

const StepByStepGuides: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<GuideListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openGuideModal = (guide: GuideListItem) => {
    setSelectedGuide(guide);
    setIsModalOpen(true);
  };

  const closeGuideModal = () => {
    setIsModalOpen(false);
    setSelectedGuide(null);
  };

  return (
    <div className="p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6 text-primary">Step-by-Step Growing Guides</h2>

      {sampleGuides.length === 0 ? (
        <p className="text-muted-foreground">No growing guides available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleGuides.map(guide => (
            <button
              key={guide.id}
              onClick={() => openGuideModal(guide)}
              className="block p-4 bg-muted/50 hover:bg-muted rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary text-left"
            >
              <h3 className="text-lg font-medium text-card-foreground mb-1">{guide.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{guide.shortDescription}</p>
            </button>
          ))}
        </div>
      )}

      {selectedGuide && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">{selectedGuide.content.title}</DialogTitle>
              <DialogDescription>
                Method(s): {selectedGuide.content.tags.join(', ')}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-6 -mr-6 mt-4 mb-4"> {/* Apply negative margin to offset ScrollArea's own padding if any */}
              <div className="space-y-4 text-sm text-card-foreground">
                <div>
                  <h4 className="font-semibold text-md mb-1">Planting Instructions:</h4>
                  <p className="text-muted-foreground">{selectedGuide.content.planting}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Watering Schedule/Tips:</h4>
                  <p className="text-muted-foreground">{selectedGuide.content.watering}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Spacing Requirements:</h4>
                  <p className="text-muted-foreground">{selectedGuide.content.spacing}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Fertilizing Advice:</h4>
                  <p className="text-muted-foreground">{selectedGuide.content.fertilizing}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md mb-1">Harvesting Instructions:</h4>
                  <p className="text-muted-foreground">{selectedGuide.content.harvesting}</p>
                </div>
              </div>
            </ScrollArea>
            <DialogClose asChild>
              <Button variant="outline" onClick={closeGuideModal} className="mt-auto">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StepByStepGuides;
