"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Briefcase, Lightbulb, Trophy, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';

// A placeholder for your auth hook - replace with your actual implementation
const useAuth = () => ({
    user: { 
        uid: 'user1-id-from-auth', // Replace with dynamic user ID from your auth state
    } 
});

interface UserProfile {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    banner: string;
    dataAiHint?: string;
    dataAiHintBanner?: string;
}

// TODO: Replace with a real data fetch from a 'user_timeline' collection
const timeline = [
    { icon: Trophy, title: 'Launched AI Startup "Nexus"', date: 'Jan 2024', type: 'achievement' },
    { icon: Briefcase, title: 'Joined Cultured Nomads as Mentor', date: 'Aug 2023', type: 'milestone' },
    { icon: Lightbulb, title: 'Published paper on Ethical AI', date: 'May 2023', type: 'achievement' },
];

const badges = ['Top Mentor', 'AI Pioneer', 'Community Builder', 'Speaker'];

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!authUser) return;

        const fetchUser = async () => {
            const db = getFirestore(app);
            // In a real app, you might get the userId from URL params or auth state
            const userId = authUser.uid; 
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()) {
                const userData = userSnap.data()
                setUser({
                    name: userData.name,
                    role: userData.role,
                    bio: userData.bio,
                    avatar: userData.avatar || 'https://placehold.co/150x150.png',
                    banner: userData.banner || 'https://placehold.co/1200x400.png',
                    dataAiHint: 'woman portrait',
                    dataAiHintBanner: 'abstract purple',
                });
            }
            setLoading(false);
        }

        fetchUser();

    }, [authUser]);


    if(loading) {
        return (
             <div className="space-y-8">
                <Card className="glass-card overflow-hidden">
                    <Skeleton className="h-48 md:h-64 w-full" />
                    <div className="p-6 pt-0 flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-16 relative z-10">
                        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background ring-4 ring-primary" />
                        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
                            <Skeleton className="h-10 w-1/2 mb-2" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                        <Skeleton className="h-12 w-32 rounded-md mt-4 md:mt-0" />
                    </div>
                </Card>
             </div>
        )
    }

    if(!user) {
        return <PageHeader title="User not found" description="This user profile could not be loaded." />
    }

    return (
        <div className="space-y-8">
            {/* Banner and Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="glass-card overflow-hidden">
                    <div className="relative h-48 md:h-64 w-full">
                        <Image src={user.banner} alt="Banner" layout="fill" objectFit="cover" data-ai-hint={user.dataAiHintBanner} />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                    <div className="p-6 pt-0 flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-16 relative z-10">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background ring-4 ring-primary">
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
                            <h1 className="font-headline text-3xl md:text-4xl font-bold">{user.name}</h1>
                            <p className="text-primary font-semibold">{user.role}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button className="glow-button-accent">
                                Mentor Me
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Bio & Badges) */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Bio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground/80">{user.bio}</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Badges</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {badges.map(badge => (
                                    <Badge key={badge} variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-sm py-1 px-3">
                                        {badge}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column (Timeline) */}
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="font-headline text-2xl">Growth Log</CardTitle>
                                <Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Milestone</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {timeline.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-primary/20 p-3 rounded-full">
                                                    <item.icon className="h-5 w-5 text-primary" />
                                                </div>
                                                {index < timeline.length - 1 && <div className="w-px flex-1 bg-primary/20 my-2"></div>}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-sm text-foreground/70">{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
