
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/page-header';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { collection, getDocs, query, orderBy, where, getFirestore, Timestamp, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';

const moods = ['All', 'Wins', 'Fails', 'Lessons', 'Real Talk'];

const getMoodClass = (mood: string) => {
    switch(mood) {
        case 'Wins': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'Fails': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'Lessons': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'Real Talk': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return '';
    }
}

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
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
};

interface Story {
    id: string;
    author: string;
    title: string;
    excerpt: string;
    tags: string[];
    avatar: string;
    dataAiHint?: string;
    likes: number;
    commentCount: number;
    createdAt: Timestamp;
}

export default function StoriesPage() {
    const [activeMood, setActiveMood] = useState('All');
    const [stories, setStories] = useState<Story[]>([]);
    const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            const db = getFirestore(app);
            const storiesCollection = collection(db, 'stories');
            let q;

            if (activeMood === 'All') {
                q = query(storiesCollection, orderBy('createdAt', 'desc'));
            } else {
                q = query(storiesCollection, where('tags', 'array-contains', activeMood), orderBy('createdAt', 'desc'));
            }
            const storySnapshot = await getDocs(q);
            const storyList = storySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
            setStories(storyList);

            if(featuredStories.length === 0) {
                const featuredQuery = query(storiesCollection, orderBy('createdAt', 'desc'), limit(5));
                const featuredSnapshot = await getDocs(featuredQuery);
                const featuredList = featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()} as Story));
                setFeaturedStories(featuredList);
            }

            setLoading(false);
        };

        fetchStories();
    }, [activeMood]);

    return (
        <div className="space-y-8">
            <PageHeader title="Stories & Journal" description="Share your journey. Celebrate your wins. Learn from it all." />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {moods.map(mood => (
                        <Button 
                            key={mood}
                            variant={activeMood === mood ? 'default' : 'ghost'}
                            onClick={() => setActiveMood(mood)}
                            className={cn(
                                "rounded-full transition-all",
                                activeMood === mood && 'glow-button'
                            )}
                        >
                            {mood}
                        </Button>
                    ))}
                </div>
                <Button className="glow-button-accent hidden sm:flex">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                </Button>
            </div>

            <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                <CarouselContent>
                    {loading && featuredStories.length === 0 ? (
                        Array.from({length: 3}).map((_, i) => (
                            <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-4 border-l-4 border-primary glass-card h-full space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                           </CarouselItem>
                        ))
                    ) : (
                        featuredStories.map((story) => (
                        <CarouselItem key={story.id} className="md:basis-1/2 lg:basis-1/3">
                            <blockquote className="p-4 border-l-4 border-primary glass-card h-full flex flex-col justify-between">
                                <p className="italic text-lg">"{story.excerpt}"</p>
                                <footer className="mt-2 text-sm font-headline">- {story.author}</footer>
                            </blockquote>
                        </CarouselItem>
                        ))
                    )}
                </CarouselContent>
            </Carousel>


            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {loading ? (
                    Array.from({length: 6}).map((_, i) => (
                        <Card key={i} className="glass-card flex flex-col h-full">
                           <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <Skeleton className="h-6 w-full mb-2" />
                                <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-full mt-1" />
                                <Skeleton className="h-4 w-3/4 mt-1" />
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-20" />
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    stories.map(story => (
                        <motion.div key={story.id} variants={itemVariants} whileHover={{y: -5}}>
                            <Card className="glass-card flex flex-col h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={story.avatar} alt={story.author} data-ai-hint={story.dataAiHint} />
                                            <AvatarFallback>{story.author?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{story.author}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {story.tags?.map(tag => (
                                                    <Badge key={tag} className={cn(getMoodClass(tag))}>{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <h3 className="font-headline text-xl font-bold mb-2">{story.title}</h3>
                                    <p className="text-foreground/80">{story.excerpt}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex gap-4 text-foreground/70">
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors"><Heart className="h-4 w-4" /> {story.likes || 0}</button>
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> {story.commentCount || 0}</button>
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /></button>
                                    </div>
                                    <Button variant="link" className="text-primary">Read More</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
}
