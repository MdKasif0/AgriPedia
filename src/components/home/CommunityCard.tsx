'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Image, 
  Trophy, 
  Calendar,
  Bell,
  Settings,
  Shield,
  Share2,
  BookOpen,
  HelpCircle,
  Star,
  TrendingUp,
  MapPin,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
    title: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
  timestamp: string;
}

interface GrowSpace {
  id: string;
  name: string;
  description: string;
  members: number;
  image: string;
  category: string;
}

interface CommunityStats {
  followers: number;
  following: number;
  posts: number;
  badges: number;
  level: number;
  title: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Green',
      avatar: '/avatars/sarah.jpg',
      level: 5,
      title: 'Tomato Expert'
    },
    content: 'Just harvested my first batch of cherry tomatoes! 🍅 #FirstHarvest #Tomatoes',
    image: '/plants/tomato-harvest.jpg',
    likes: 24,
    comments: 5,
    tags: ['tomatoes', 'harvest', 'success'],
    timestamp: '2h ago'
  },
  // Add more mock posts...
];

const mockGrowSpaces: GrowSpace[] = [
  {
    id: '1',
    name: 'Urban Gardeners',
    description: 'A community for city dwellers growing their own food',
    members: 1234,
    image: '/groups/urban-garden.jpg',
    category: 'Urban Gardening'
  },
  // Add more mock spaces...
];

export function CommunityCard() {
  const [activeTab, setActiveTab] = useState('feed');
  const [stats] = useState<CommunityStats>({
    followers: 156,
    following: 89,
    posts: 42,
    badges: 8,
    level: 5,
    title: 'Tomato Expert'
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community & Sharing</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Avatar className="w-16 h-16">
          <AvatarImage src="/avatars/user.jpg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">John Doe</h3>
            <Badge variant="secondary">
              Level {stats.level} • {stats.title}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>{stats.followers} Followers</span>
            <span>{stats.following} Following</span>
            <span>{stats.posts} Posts</span>
            <span>{stats.badges} Badges</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="feed">
            <TrendingUp className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="spaces">
            <Users className="w-4 h-4 mr-2" />
            GrowSpaces
          </TabsTrigger>
          <TabsTrigger value="qa">
            <HelpCircle className="w-4 h-4 mr-2" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Image className="w-4 h-4 mr-2" />
                Share Photo
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Write Post
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {mockPosts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>
                          {post.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{post.user.name}</span>
                          <Badge variant="secondary">
                            Level {post.user.level} • {post.user.title}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {post.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="mb-3">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="rounded-lg mb-3 w-full h-48 object-cover"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="spaces" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {mockGrowSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                <img
                  src={space.image}
                  alt={space.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">{space.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {space.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{space.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {space.members} members
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qa" className="mt-4">
          <div className="space-y-4">
            <Button className="w-full">
              <HelpCircle className="w-4 h-4 mr-2" />
              Ask a Question
            </Button>
            <ScrollArea className="h-[400px]">
              {/* Q&A content */}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">Best-Looking Veggie Contest</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit your best-looking vegetables for a chance to win!
                  </p>
                </div>
              </div>
            </Card>
            {/* More events */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Privacy Settings */}
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile">Public Profile</Label>
            <Switch id="public-profile" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="share-journal">Share Plant Journal</Label>
            <Switch id="share-journal" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-location">Show Location</Label>
            <Switch id="show-location" />
          </div>
        </div>
      </div>
    </Card>
  );
} 