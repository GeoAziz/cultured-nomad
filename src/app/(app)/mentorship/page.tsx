
"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { Star, Wand2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth, UserProfile } from '@/hooks/use-auth';
import { matchMentor } from '@/ai/flows/mentor-matcher-flow';


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
    transition: { type: 'spring' },
  },
};

// This can be converted to a collection if needed
const reviews = [
    { name: 'Priya Sharma', text: 'Zoe is an exceptional mentor. Her guidance was pivotal in my last funding round.', rating: 5, avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman smile' },
    { name: 'Mei Lin', text: 'Aisha breaks down complex tech concepts like no one else. Highly recommend!', rating: 5, avatar: 'https://placehold.co/100x100.png', dataAiHint: 'asian woman' },
    { name: 'Fatima Al-Jamil', text: 'The mission briefing with my mentor was so inspiring and gave me a clear path forward.', rating: 5, avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman professional' },
]

interface Mentor extends UserProfile {
    isMentor: boolean;
    dataAiHint?: string;
    bio?: string;
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matchOfTheWeek, setMatchOfTheWeek] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchReason, setMatchReason] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);


  useEffect(() => {
    const fetchMentorsAndMatch = async () => {
        setLoading(true);
        const db = getFirestore(app);
        const membersCollection = collection(db, 'users');
        const q = query(membersCollection, where('isMentor', '==', true));
        const mentorSnapshot = await getDocs(q);
        const mentorList: Mentor[] = mentorSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid || doc.id,
            name: data.name || '',
            email: data.email || '',
            avatar: data.avatar || '',
            role: data.role || 'mentor',
            isMentor: data.isMentor === true,
            industry: (data as any).industry || 'Tech',
            interests: (data as any).interests || [],
            bio: (data as any).bio || '',
            dataAiHint: (data as any).dataAiHint,
          };
        });
        setMentors(mentorList);

        if (user && mentorList.length > 0) {
            try {
                // Prepare input for the AI flow
                const flowInput = {
                    user: {
                        bio: (user as any).bio || 'A new member seeking guidance.',
                        interests: (user as any).interests || []
                    },
          mentors: mentorList.map(m => ({
            id: m.uid,
            name: m.name || '',
            bio: m.bio || '',
            industry: m.industry || '',
            interests: Array.isArray(m.interests) ? m.interests : [],
          }))
                };
                const { mentorId, reason } = await matchMentor(flowInput);
                const bestMatch = mentorList.find(m => m.uid === mentorId);
                setMatchOfTheWeek(bestMatch || mentorList[0]);
                setMatchReason(reason);
            } catch (aiError) {
                 console.error("AI matching failed:", aiError);
                 // Fallback to simple logic if AI fails
                 setMatchOfTheWeek(mentorList[new Date().getDay() % mentorList.length]);
                 setMatchReason("A great mentor to start your journey.");
            }
        } else if (mentorList.length > 0) {
            // Fallback for non-logged-in users or if user data is missing
            setMatchOfTheWeek(mentorList[0]);
        }

        setLoading(false);
    };

    if(user !== undefined) {
        fetchMentorsAndMatch();
    }
  }, [user]);

  const handleRequestMentorship = async (mentorId: string) => {
    if (!requestMessage.trim()) {
        toast({ title: "Message is required", description: "Please write a short message to your potential mentor.", variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
    const db = getFirestore(app);
    if (!user?.uid) throw new Error('User not authenticated');
    // Check mentor exists and isMentor
    const mentorRef = doc(db, 'users', mentorId);
    const mentorDoc = await getDoc(mentorRef);
    if (!mentorDoc.exists() || !mentorDoc.data()?.isMentor) {
      toast({ title: "Mentor not found or not a mentor.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    await addDoc(collection(db, 'mentorships'), {
      userId: user.uid,
      mentorId,
      status: "pending",
      message: requestMessage,
  userBio: (user as any).bio,
      createdAt: serverTimestamp(),
    });
    toast({ title: "Request Sent!", description: "Your mentorship request has been sent. You'll be notified when they respond." });
    setRequestMessage('');
    setDialogOpen(false);
    } catch(error: any) {
        console.error("Error requesting mentorship", error);
        toast({ title: "Error", description: error.message || "Something went wrong.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <div className="space-y-12">
      <PageHeader title="Mentorship Hub" description="Find your guide. Accelerate your growth." />

      {/* Match of the Week */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        {loading || !matchOfTheWeek ? (
             <Card className="glass-card overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 flex flex-col justify-center">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-12 w-3/4 mb-2" />
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <Skeleton className="h-12 w-full mb-6" />
                        <Skeleton className="h-12 w-48" />
                    </div>
                    <Skeleton className="min-h-[300px] w-full" />
                </div>
             </Card>
        ) : (
            <Card className="glass-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit bg-primary/20 text-primary border-primary/30 mb-4">Your AI-Powered Match</Badge>
                <h2 className="font-headline text-3xl md:text-4xl font-bold">{matchOfTheWeek.name}</h2>
                <p className="text-lg text-foreground/80 mt-2">{(matchOfTheWeek as any).industry} Guru</p>
                <p className="mt-4 text-sm text-primary italic">"{matchReason}"</p>
                <p className="mt-4">{matchOfTheWeek.bio}</p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="glow-button mt-6 w-fit" disabled={user?.role?.toLowerCase() === 'mentor'}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Request Mentorship
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline text-2xl text-primary">Request Mentorship with {matchOfTheWeek.name}</DialogTitle>
                        <DialogDescription>
                            Send a message to introduce yourself and what you're looking for in a mentor.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea 
                                placeholder="Hi! I'm looking for guidance on..."
                                value={requestMessage}
                                onChange={e => setRequestMessage(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleRequestMentorship(matchOfTheWeek.uid)} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
                <div className="relative min-h-[300px]">
                    <Image src={matchOfTheWeek.avatar!} alt={matchOfTheWeek.name!} layout="fill" objectFit="cover" data-ai-hint={matchOfTheWeek.dataAiHint} />
                </div>
            </div>
            </Card>
        )}
      </motion.div>

      {/* Browse Mentors */}
      <div>
        <h2 className="font-headline text-3xl mb-6">Browse All Mentors</h2>
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {loading ? (
             Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="glass-card text-center p-6 flex flex-col items-center">
                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                </Card>
             ))
          ) : (
            mentors.map(mentor => (
                <motion.div key={mentor.uid} variants={itemVariants} whileHover={{ y: -5 }}>
                <Card className="glass-card text-center p-6 flex flex-col items-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                    <AvatarImage src={mentor.avatar} alt={mentor.name!} data-ai-hint={mentor.dataAiHint} />
                    <AvatarFallback>{mentor.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-headline text-lg font-bold">{mentor.name}</h3>
                    <p className="text-sm text-foreground/70 mb-4">{(mentor as any).industry}</p>
                    <Button variant="outline" className="w-full">View Profile</Button>
                </Card>
                </motion.div>
            ))
          )}
        </motion.div>
      </div>

       {/* Feedback Slider */}
       <div>
        <h2 className="font-headline text-3xl mb-6">Sisterhood Success Stories</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="glass-card h-full">
                    <CardContent className="flex flex-col items-center text-center justify-center p-6">
                        <Avatar className="w-16 h-16 mb-4">
                            <AvatarImage src={review.avatar} alt={review.name} data-ai-hint={review.dataAiHint} />
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="italic">"{review.text}"</p>
                        <p className="font-bold mt-4 font-headline">{review.name}</p>
                        <div className="flex mt-2">
                            {Array(review.rating).fill(0).map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

    </div>
  );
}
