"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  tags: string[];
  createdAt: Date;
}

export default function StoriesWidget() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      const db = getFirestore(app);
      const storiesQuery = query(
        collection(db, 'stories'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(storiesQuery);
      const storiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Story[];

      setStories(storiesList);
      setLoading(false);
    };

    fetchStories();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recent Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="space-y-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={story.author.avatar} />
                  <AvatarFallback>{story.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{story.author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">{story.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {story.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4" />
                    <span>{story.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span>{story.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {stories.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-4">No stories yet</p>
          )}
        </div>
        <Button variant="link" className="w-full mt-4">Read More Stories</Button>
      </CardContent>
    </Card>
  );
}
