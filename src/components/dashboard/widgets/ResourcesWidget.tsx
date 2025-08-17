"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Share2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  url: string;
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: Date;
}

export default function ResourcesWidget() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      const db = getFirestore(app);
      const resourcesQuery = query(
        collection(db, 'resources'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(resourcesQuery);
      const resourcesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Resource[];

      setResources(resourcesList);
      setLoading(false);
    };

    fetchResources();
  }, []);

  const getResourceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return 'bg-blue-500/10 text-blue-500';
      case 'video':
        return 'bg-red-500/10 text-red-500';
      case 'course':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Resources
          </CardTitle>
          {user?.role === 'mentor' || user?.role === 'techie' ? (
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="p-3 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{resource.title}</h4>
                    <Badge variant="secondary" className={getResourceTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>By {resource.createdBy.name}</span>
                    <span>•</span>
                    <Badge variant="outline">{resource.createdBy.role}</Badge>
                  </div>
                </div>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
          {resources.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-4">No resources available</p>
          )}
        </div>
        <Button variant="link" className="w-full mt-4">Browse All Resources</Button>
      </CardContent>
    </Card>
  );
}