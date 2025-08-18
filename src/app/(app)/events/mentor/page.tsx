
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Loader2, Calendar as CalendarIconComponent } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  },
};

export default function MentorEventsPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Online');
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleCreateEvent = async () => {
        if (!title || !description || !date || !location || !type || !user) {
            toast({
                title: "Missing Fields",
                description: "Please fill out all required fields.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const db = getFirestore(app);
            await addDoc(collection(db, 'events'), {
                title,
                description,
                date: serverTimestamp.from(date),
                location,
                type,
                roles: roles.length > 0 ? roles : ['member', 'seeker', 'mentor', 'techie'],
                host: user.name,
                hostId: user.uid,
                image: `https://placehold.co/600x400.png`,
                dataAiHint: 'event cover',
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Event Created!",
                description: `"${title}" is now live for members to join.`
            });
            // Reset form
            setTitle('');
            setDescription('');
            setDate(undefined);
            setLocation('');
            setType('Online');
            setRoles([]);

        } catch (error: any) {
            console.error("Error creating event:", error);
            toast({
                title: "Creation Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <PageHeader title="Event Command Center" description="Create and manage your events for the sisterhood." />

            <motion.div variants={itemVariants}>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <PlusCircle className="text-primary" />
                            Create New Event
                        </CardTitle>
                        <CardDescription>
                            Host a workshop, fireside chat, or mixer. Share your wisdom with the community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title</Label>
                                <Input id="title" placeholder="e.g., Intro to Web3 for Founders" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date & Time</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIconComponent className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Share what the event is about..." className="min-h-[120px]" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location / URL</Label>
                                <Input id="location" placeholder="e.g., Google Meet Link or 'Community Hub'" value={location} onChange={e => setLocation(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="In-Person">In-Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleCreateEvent} disabled={loading} className="glow-button-accent ml-auto">
                            {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                            Create Event
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                 <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">My Hosted Events</CardTitle>
                        <CardDescription>A list of events you are currently hosting.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Event list will be rendered here */}
                        <div className="text-center text-muted-foreground py-8">
                            You haven't created any events yet.
                        </div>
                    </CardContent>
                 </Card>
            </motion.div>
        </motion.div>
    );
}

