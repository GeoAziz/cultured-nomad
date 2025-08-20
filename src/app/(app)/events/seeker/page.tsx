
"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, MapPin, CheckCircle2 } from 'lucide-react';
import { collection, query, where, onSnapshot, getFirestore, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';

type EventType = {
  id: string;
  title: string;
  location: string;
  date: Date | null;
  status: string;
};

function EventsSeekerPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role.toUpperCase() !== 'SEEKER') {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirestore(app);
    const eventsCollection = collection(db, 'events');
    const q = query(
      eventsCollection,
      where('attendees', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Event',
          location: data.location || 'TBA',
          date: data.date ? (data.date as Timestamp).toDate() : null,
          status: data.status || 'upcoming',
        };
      });
      setEvents(list);
      setLoading(false);
    }, (error) => {
      toast({
        title: 'Error Loading Events',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader title="Your Events" description="See events you are attending or invited to." />
      <Card className="glass-card p-6 mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <CalendarDays className="mx-auto mb-2 h-8 w-8" />
            <p>No events found. Join or RSVP to events!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e => (
              <div key={e.id} className="p-4 rounded-lg bg-card/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  <p className="text-sm text-foreground/70">Location: {e.location}</p>
                  {e.date && (
                    <p className="text-xs text-foreground/50">Date: {format(e.date, 'PPP')}</p>
                  )}
                </div>
                <div>
                  {e.status === 'attending' ? (
                    <CheckCircle2 className="text-green-500 h-6 w-6" />
                  ) : (
                    <CalendarDays className="text-blue-500 h-6 w-6" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function EventsSeekerPageWrapper() {
  return (
    <AuthGuard requiredRole="SEEKER">
      <EventsSeekerPage />
    </AuthGuard>
  );
}
