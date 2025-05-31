import tomatoGuide from './tomato_guide.json';
import basilGuide from './basil_guide.json';
// Add other guides here

export interface GuideSection {
  title: string;
  content: string;
}

export interface PlantGuide {
  id: string;
  plantName: string;
  plantId?: string;
  introduction: string;
  sections: GuideSection[];
  methodsCovered: string[];
}

export const allGuides: PlantGuide[] = [tomatoGuide, basilGuide /*, ... */];

export const getGuideById = (id: string): PlantGuide | undefined => {
  return allGuides.find(guide => guide.id === id);
};
