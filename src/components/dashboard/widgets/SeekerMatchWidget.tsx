
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, UserProfile } from '@/hooks/use-auth';
import { Users, Target, Sparkles, Clock, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { matchMentor, MatchMentorInput } from 'functions/src/ai/flows/mentor-matcher-flow';
import Link from 'next/link';

interface Mentor extends UserProfile {
    isMentor: boolean;
    dataAiHint?: string;
    bio?: string;
}

export default function SeekerMatchWidget() {
  const { user } = useAuth();
  const [match, setMatch] = useState<Mentor | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMatch = async () => {
        setLoading(true);
        const db = getFirestore(app);
        const mentorsQuery = query(collection(db, 'users'), where('isMentor', '==', true));
        
        try {
            const mentorSnapshot = await getDocs(mentorsQuery);
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

            if (mentorList.length > 0) {
                 const flowInput: MatchMentorInput = {
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
                setMatch(bestMatch || null);
                setReason(reason);
            }
        } catch (error) {
            console.error("Failed to fetch mentor match:", error);
            // Handle error gracefully, maybe set a default state
        } finally {
            setLoading(false);
        }
    };

    fetchMatch();
  }, [user]);

  const profileCompleteness = (user && (user as any).bio) ? 85 : 40;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
            <Wand2 /> AI Mentor Match
        </CardTitle>
        <CardDescription>Your weekly suggested mentor, powered by AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ) : match ? (
             <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-lg bg-card/50">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={match.avatar} alt={match.name!} data-ai-hint={match.dataAiHint} />
                    <AvatarFallback>{match.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-lg">{match.name}</h3>
                    <p className="text-sm text-muted-foreground">{match.industry}</p>
                    <p className="text-sm text-primary italic mt-1">"{reason}"</p>
                </div>
                <Link href="/mentorship" passHref>
                    <Button>View Profile</Button>
                </Link>
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Could not find a mentor match at this time.</p>
        )}

        <div>
            <div className="flex justify-between items-center mb-1">
                <Label htmlFor="profile-completeness" className="text-sm">Profile Completeness</Label>
                <span className="text-sm font-bold text-primary">{profileCompleteness}%</span>
            </div>
            <Progress value={profileCompleteness} id="profile-completeness" />
            {profileCompleteness < 80 && 
                <p className="text-xs text-muted-foreground mt-1">
                    <Link href="/profile" className="underline hover:text-primary">Complete your profile</Link> for even better matches!
                </p>
            }
        </div>
      </CardContent>
    </Card>
  );
}
