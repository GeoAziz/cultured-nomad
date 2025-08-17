"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, Target, Sparkles, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SeekerMatchWidget() {
  const { user } = useAuth();
  const [matches, setMatches] = useState({
    potentialMentors: 0,
    matchScore: 0,
    goalsProgress: 0,
    nextSession: null as Date | null,
  });

  useEffect(() => {
    const fetchSeekerStats = async () => {
      if (!user?.uid) return;
      
      const db = getFirestore(app);
      // Fetch potential mentor matches
      const mentorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'mentor'),
        where('industry', '==', user.industry)
      );
      
      const mentorsSnapshot = await getDocs(mentorsQuery);
      setMatches(prev => ({ ...prev, potentialMentors: mentorsSnapshot.size }));
      
      // Add more match-related queries here
    };

    fetchSeekerStats();
  }, [user]);

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <CardHeader>
          <CardTitle className="text-lg">Your Mentorship Journey</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Match Score</p>
              <div className="flex items-center gap-2">
                <Progress value={matches.matchScore} />
                <span className="text-sm font-medium">{matches.matchScore}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Goals Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={matches.goalsProgress} />
                <span className="text-sm font-medium">{matches.goalsProgress}%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Mentors</p>
                    <p className="text-2xl font-bold">{matches.potentialMentors}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Session</p>
                    <p className="text-2xl font-bold">
                      {matches.nextSession 
                        ? new Date(matches.nextSession).toLocaleDateString()
                        : "Not Scheduled"}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Button className="w-full">Find Your Mentor Match</Button>
        </CardContent>
      </Card>
    </div>
  );
}
