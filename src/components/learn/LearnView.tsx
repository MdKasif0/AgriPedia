import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, FileText } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  imageUrl: string;
  readTime: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Essential Plant Care Tips for Beginners',
    description: 'Learn the fundamental principles of plant care, from watering to sunlight requirements.',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'Understanding Plant Diseases',
    description: 'A comprehensive guide to identifying and treating common plant diseases.',
    type: 'guide',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78',
    readTime: '8 min read',
  },
  {
    id: '3',
    title: 'Seasonal Gardening Guide',
    description: 'Learn what to plant and when for optimal growth throughout the year.',
    type: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2',
    readTime: '12 min read',
  },
];

export function LearnView() {
  const getIcon = (type: Article['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {getIcon(article.type)}
                {article.readTime}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.description}
              </p>
              <Button variant="outline" className="w-full">
                Read More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plant Care Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Indoor Plants',
              'Outdoor Gardening',
              'Vegetables',
              'Herbs',
              'Flowers',
              'Succulents',
              'Trees',
              'Hydroponics',
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="h-auto py-4"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 