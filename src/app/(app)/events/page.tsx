
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PageHeader from '@/components/shared/page-header';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy, getFirestore, Timestamp, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
    },
  },
};


interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  host: string;
  image: string;
  dataAiHint: string;
  description?: string;
  location?: string;
  roles?: string[];
}

export default function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});
  const [attendees, setAttendees] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEventsAndRsvps = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const eventsCollection = collection(db, 'events');
      let q;
      // Role-based event filtering
      if (user && user.role) {
        q = query(eventsCollection, where('roles', 'array-contains', user.role), orderBy('date', 'desc'));
      } else {
        q = query(eventsCollection, orderBy('date', 'desc'));
      }
      const eventSnapshot = await getDocs(q);
      const eventList = eventSnapshot.docs.map(doc => {
        const data = doc.data();
        const eventDate = data.date instanceof Timestamp ? data.date.toDate() : new Date();
        return { id: doc.id, ...data, date: eventDate } as Event;
      });
      setEvents(eventList);

      // Fetch RSVPs and attendees for each event
      if (user) {
        const userRsvps: Record<string, boolean> = {};
        const eventAttendees: Record<string, string[]> = {};
        for (const event of eventList) {
          // User RSVP
          const rsvpRef = doc(db, 'event_rsvps', `${user.uid}_${event.id}`);
          const rsvpSnap = await getDoc(rsvpRef);
          if (rsvpSnap.exists()) {
            userRsvps[event.id] = true;
          }
          // Attendee list
          const rsvpQuery = query(collection(db, 'event_rsvps'), where('eventId', '==', event.id));
          const rsvpSnapshot = await getDocs(rsvpQuery);
          eventAttendees[event.id] = rsvpSnapshot.docs.map(d => d.data().userId);
        }
        setRsvps(userRsvps);
        setAttendees(eventAttendees);
      }
      setLoading(false);
    };
    fetchEventsAndRsvps();
  }, [user]);

  const handleRsvp = async (eventId: string, eventTitle: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "You must be logged in to RSVP.", variant: "destructive" });
      return;
    }
    setRsvpLoading(prev => ({...prev, [eventId]: true}));
    try {
      const db = getFirestore(app);
      const rsvpRef = doc(db, 'event_rsvps', `${user.uid}_${eventId}`);
      if (!rsvps[eventId]) {
        await setDoc(rsvpRef, {
          userId: user.uid,
          eventId,
          createdAt: new Date(),
        });
        setRsvps(prev => ({...prev, [eventId]: true}));
        toast({
          title: '🎉 RSVP Confirmed!',
          description: `You're all set for "${eventTitle}".`,
        });
      } else {
        await deleteDoc(rsvpRef);
        setRsvps(prev => ({...prev, [eventId]: false}));
        toast({
          title: 'RSVP Removed',
          description: `We've removed your RSVP for "${eventTitle}".`,
        });
      }
    } catch (error: any) {
      console.error("Error RSVPing to event:", error);
      toast({
        title: "RSVP Failed",
        description: error.message || "Could not save your RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRsvpLoading(prev => ({...prev, [eventId]: false}));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Events" description="Join workshops, mixers, and fireside chats." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-4"
              modifiers={{
                events: events.map(e => e.date)
              }}
              modifiersStyles={{
                events: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                  boxShadow: '0 0 8px hsl(var(--primary))',
                },
              }}
            />
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="font-headline text-3xl">Upcoming Events</h2>
      {loading ? (
       Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="glass-card flex flex-col md:flex-row overflow-hidden">
           <Skeleton className="md:w-1/3 h-48 md:h-auto" />
           <div className="md:w-2/3 flex flex-col p-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2 mb-6" />
            <Skeleton className="h-10 w-32" />
           </div>
        </Card>
       ))
      ) : (
      events.map(event => {
        const isRsvpd = rsvps[event.id];
        const isRsvpLoading = rsvpLoading[event.id];
        return (
          <motion.div key={event.id} variants={itemVariants} whileHover={{ y: -5 }}>
            <Card className="glass-card flex flex-col md:flex-row overflow-hidden">
              <div className="md:w-1/3 relative min-h-[200px]">
                <Image src={event.image} alt={event.title} layout="fill" className="object-cover" data-ai-hint={event.dataAiHint} />
              </div>
              <div className="md:w-2/3 flex flex-col">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{event.type}</Badge>
                  <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    {event.location && <Badge>{event.location}</Badge>}
                    {event.roles && event.roles.map(role => <Badge key={role}>{role}</Badge>)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="mb-2">{event.description}</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        Hosted by {event.host}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 glass-card">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="https://placehold.co/100x100.png" />
                          <AvatarFallback>ZH</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{event.host}</p>
                          <p className="text-sm text-muted-foreground">Tech Mentor</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-2">
                    <strong>Attendees:</strong>
                    <ul className="list-disc ml-4">
                      {attendees[event.id]?.length ? attendees[event.id].map(uid => <li key={uid}>{uid}</li>) : <li>No RSVPs yet</li>}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleRsvp(event.id, event.title)} disabled={isRsvpLoading} className={isRsvpd ? '' : 'glow-button-accent'}>
                    {isRsvpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                      isRsvpd ? <><CheckCircle className="mr-2 h-4 w-4" /> RSVP'd</> : <><PlusCircle className="mr-2 h-4 w-4" /> RSVP Now</>}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
