
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Session {
    id: string;
    menteeName: string;
    menteeAvatar: string;
    startTime: Date;
    title: string;
}

export default function UpcomingSessionsWidget() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const sessionsQuery = query(
        collection(db, 'mentoring_sessions'),
        where('mentorId', '==', user.uid),
        where('startTime', '>=', new Date()),
        orderBy('startTime', 'asc'),
        limit(3)
      );

      try {
        const snapshot = await getDocs(sessionsQuery);
        const sessionsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startTime: (data.startTime as Timestamp).toDate(),
            } as Session
        });
        setSessions(sessionsList);
      } catch (error) {
        console.error("Error fetching upcoming sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Upcoming Sessions</CardTitle>
        <CardDescription>Your next scheduled mentorship calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
             Array.from({length: 2}).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-primary/5">
              <Avatar>
                <AvatarImage src={session.menteeAvatar} />
                <AvatarFallback>{session.menteeName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{session.menteeName}</p>
                <p className="text-sm text-muted-foreground">{session.title}</p>
                <p className="text-xs text-primary">{session.startTime.toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">No upcoming sessions.</p>
        )}
        <Button variant="outline" className="w-full mt-4">View Full Calendar</Button>
      </CardContent>
    </Card>
  );
}
