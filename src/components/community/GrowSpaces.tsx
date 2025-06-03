'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Image, 
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Leaf,
  Target,
  Flask
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GrowSpace {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  image: string;
  tags: string[];
  recentActivity: {
    type: 'post' | 'photo' | 'event';
    content: string;
    author: {
      name: string;
      avatar: string;
    };
    timestamp: string;
  }[];
}

const mockSpaces: GrowSpace[] = [
  {
    id: '1',
    name: 'Urban Gardeners',
    description: 'A community for city dwellers growing their own food',
    category: 'Urban Gardening',
    members: 1234,
    image: '/groups/urban-garden.jpg',
    tags: ['urban', 'container-gardening', 'balcony-garden'],
    recentActivity: [
      {
        type: 'post',
        content: 'Just harvested my first batch of cherry tomatoes!',
        author: {
          name: 'Sarah Green',
          avatar: '/avatars/sarah.jpg'
        },
        timestamp: '2h ago'
      }
    ]
  },
  // Add more mock spaces...
];

const categories = [
  { id: 'plant-type', name: 'Plant Type', icon: Leaf },
  { id: 'region', name: 'Region', icon: MapPin },
  { id: 'goals', name: 'Goals', icon: Target },
  { id: 'specialties', name: 'Specialties', icon: Flask }
];

export function GrowSpaces() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={() => setShowCreateSpace(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Space
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center gap-3">
              <category.icon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Browse by {category.name.toLowerCase()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Spaces</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="active">Most Active</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mockSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {space.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {space.members.toLocaleString()} members
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground mb-3">
                    {space.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {space.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {space.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.author.avatar} />
                          <AvatarFallback>
                            {activity.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">
                              {activity.author.name}
                            </span>{' '}
                            {activity.content}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">
                    <Users className="w-4 h-4 mr-2" />
                    Join Space
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showCreateSpace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Card className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Create a GrowSpace</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Space Name
                </label>
                <Input placeholder="Enter space name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Description
                </label>
                <Input placeholder="Describe your space" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Cover Image
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop an image or click to browse
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateSpace(false)}
                >
                  Cancel
                </Button>
                <Button>Create Space</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 