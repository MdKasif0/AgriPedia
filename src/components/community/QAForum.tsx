'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle,
  Tag,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    level: number;
    title: string;
  };
  answers: number;
  votes: number;
  isAnswered: boolean;
  timestamp: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'Why are my tomato leaves turning yellow?',
    content: 'I noticed my tomato plant leaves are turning yellow from the bottom up. I water regularly and use organic fertilizer. What could be causing this?',
    tags: ['tomatoes', 'leaf-problems', 'nutrient-deficiency'],
    author: {
      name: 'Sarah Green',
      avatar: '/avatars/sarah.jpg',
      level: 5,
      title: 'Tomato Expert'
    },
    answers: 3,
    votes: 12,
    isAnswered: true,
    timestamp: '2h ago'
  },
  // Add more mock questions...
];

export function QAForum() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskQuestion, setShowAskQuestion] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={() => setShowAskQuestion(true)}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Questions</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
          <TabsTrigger value="my-questions">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="answers">Most Answers</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {mockQuestions.map((question) => (
                <Card key={question.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <span className="font-medium">{question.votes}</span>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                      {question.isAnswered && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {question.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={question.author.avatar} />
                            <AvatarFallback>
                              {question.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {question.author.name}
                          </span>
                          <Badge variant="secondary">
                            Level {question.author.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{question.answers} answers</span>
                          <span>{question.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {showAskQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Card className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Ask a Question</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Title
                </label>
                <Input placeholder="What's your question?" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Details
                </label>
                <Textarea
                  placeholder="Provide more details about your question..."
                  className="h-32"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <Input placeholder="Add tags..." />
                  <Button variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAskQuestion(false)}
                >
                  Cancel
                </Button>
                <Button>Post Question</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 