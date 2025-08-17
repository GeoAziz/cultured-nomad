"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Code, Share2, BookMarked, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Button } from '@/components/ui/button';

export default function TechieResourcesWidget() {
  const { user } = useAuth();
  const [resources, setResources] = useState({
    sharedProjects: 0,
    contributions: 0,
    savedResources: 0,
    networkSize: 0,
  });

  useEffect(() => {
    const fetchTechieStats = async () => {
      if (!user?.uid) return;
      
      const db = getFirestore(app);
      // Fetch project contributions
      const projectsQuery = query(
        collection(db, 'projects'),
        where('contributorId', '==', user.uid)
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      setResources(prev => ({ ...prev, contributions: projectsSnapshot.size }));
      
      // Add more resource-related queries here
    };

    fetchTechieStats();
  }, [user]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tech Resources & Impact</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Shared Projects</p>
                    <p className="text-2xl font-bold">{resources.sharedProjects}</p>
                  </div>
                  <Code className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Contributions</p>
                    <p className="text-2xl font-bold">{resources.contributions}</p>
                  </div>
                  <Share2 className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Saved Resources</p>
                    <p className="text-2xl font-bold">{resources.savedResources}</p>
                  </div>
                  <BookMarked className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Network Size</p>
                    <p className="text-2xl font-bold">{resources.networkSize}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Button className="w-full">Share New Resource</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
