"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'online' | 'in-person';
}

export default function EventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const db = getFirestore(app);
      const eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', new Date()),
        orderBy('date', 'asc'),
        limit(3)
      );

      const snapshot = await getDocs(eventsQuery);
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Event[];

      setEvents(eventsList);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex-1 space-y-1">
                <p className="font-medium">{event.title}</p>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">RSVP</Button>
            </div>
          ))}
          {events.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-4">No upcoming events</p>
          )}
        </div>
        <Button variant="link" className="w-full mt-4">View All Events</Button>
      </CardContent>
    </Card>
  );
}
