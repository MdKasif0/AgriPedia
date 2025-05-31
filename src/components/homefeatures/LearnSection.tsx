'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Assuming Accordion components are available
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Leaf, Recycle, CalendarDays, Wrench, HelpCircle } from 'lucide-react'; // Example icons

interface ArticlePlaceholder {
  id: string;
  title: string;
  description: string;
  // Future: link, content, etc.
}

interface LearningCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  articles: ArticlePlaceholder[];
}

const learningContent: LearningCategory[] = [
  {
    id: 'glossary',
    title: 'Gardening Glossary',
    icon: HelpCircle,
    articles: [
      { id: 'gloss1', title: 'Understanding Soil pH', description: 'Learn what pH means for your soil and how it affects plant health.' },
      { id: 'gloss2', title: 'Common Gardening Tools', description: 'An overview of essential tools for every gardener.' },
      { id: 'gloss3', title: 'N-P-K Explained', description: 'Decoding fertilizer numbers and their importance for plant nutrition.' },
    ],
  },
  {
    id: 'beginners',
    title: "Beginner's Corner",
    icon: Leaf,
    articles: [
      { id: 'beg1', title: 'Choosing Your First Plants', description: 'Easy-to-grow plants perfect for new gardeners.' },
      { id: 'beg2', title: 'Basic Watering Techniques', description: 'How, when, and how much to water your plants.' },
      { id: 'beg3', title: 'Sunlight Needs: Full Sun vs. Shade', description: 'Understanding light requirements for different plants.' },
    ],
  },
  {
    id: 'sustainable',
    title: 'Sustainable Practices',
    icon: Recycle,
    articles: [
      { id: 'sus1', title: 'Introduction to Composting', description: 'Turn kitchen scraps into nutrient-rich soil conditioner.' },
      { id: 'sus2', title: 'Water Conservation in the Garden', description: 'Tips for watering wisely and reducing water waste.' },
      { id: 'sus3', title: 'Natural Pest Control Methods', description: 'Eco-friendly ways to manage common garden pests.' },
    ],
  },
  {
    id: 'seasonal',
    title: 'Seasonal Planting Strategies',
    icon: CalendarDays,
    articles: [
      { id: 'sea1', title: 'Spring Planting Guide', description: 'What to plant for a bountiful spring harvest.' },
      { id: 'sea2', title: 'Summer Garden Care', description: 'Tips for helping your garden thrive in the heat.' },
      { id: 'sea3', title: 'Autumn Planting for Winter Harvest', description: 'Extend your growing season into the cooler months.' },
    ],
  },
  {
    id: 'diy',
    title: 'DIY Garden Projects',
    icon: Wrench,
    articles: [
      { id: 'diy1', title: 'How to Build a Raised Bed', description: 'Step-by-step guide to building your own raised garden bed.' },
      { id: 'diy2', title: 'Creating a Self-Watering Pot', description: 'A simple DIY project to keep your plants hydrated.' },
      { id: 'diy3', title: 'Making Natural Fertilizers at Home', description: 'Recipes for homemade plant food from common household items.' },
    ],
  },
];

const LearnSection: React.FC = () => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <BookOpen className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl font-semibold text-primary">Knowledge Hub</CardTitle>
        <CardDescription>Expand your gardening skills with our curated guides and articles.</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {learningContent.length === 0 ? (
          <p className="text-muted-foreground text-center">Learning materials are being cultivated. Check back soon!</p>
        ) : (
          <Accordion type="multiple" className="w-full space-y-3">
            {learningContent.map((category, index) => (
              <AccordionItem key={category.id} value={`item-${index}`} className="bg-muted/30 rounded-lg border border-border/30 px-2">
                <AccordionTrigger className="hover:no-underline py-3 px-4 text-left">
                  <div className="flex items-center text-lg">
                    <category.icon className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    {category.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  {category.articles.length > 0 ? (
                    <ul className="space-y-2.5">
                      {category.articles.map(article => (
                        <li key={article.id} className="p-3 bg-background/70 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-border/50">
                           {/* In future, this <li> could be a Link */}
                          <h4 className="font-medium text-card-foreground">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{article.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No articles in this category yet. Content coming soon!</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
         <p className="text-xs text-muted-foreground mt-8 text-center">
            Want to learn about something specific? Let us know through community feedback!
        </p>
      </CardContent>
    </Card>
  );
};

export default LearnSection;
