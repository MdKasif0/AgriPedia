import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: Date;
}

export function CommunityView() {
  const { user } = useStore();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Green',
      content: 'Just harvested my first batch of organic tomatoes! 🍅 #gardening #organic',
      imageUrl: 'https://images.unsplash.com/photo-1546094097-5c2d348c834e',
      likes: 24,
      comments: 5,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      userId: '3',
      userName: 'Mike Brown',
      content: 'Looking for advice on dealing with aphids in my rose garden. Any natural remedies? 🌹',
      likes: 12,
      comments: 8,
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    if (!user) {
      toast.error('Please login to post');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: new Date(),
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Post shared successfully!');
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={user?.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}` : undefined} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Input
                placeholder="Share your gardening journey..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <Button onClick={handlePost} className="w-full">
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={post.userAvatar} />
                <AvatarFallback>{post.userName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{post.userName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {post.timestamp.toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="rounded-lg w-full h-48 object-cover"
                />
              )}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleLike(post.id)}
              >
                <Heart className="h-4 w-4" />
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 