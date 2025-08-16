
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { affirmations } from '@/lib/mock-data'; // Affirmations can remain static for now
import { Calendar, HeartHandshake, BookOpen, MessageSquare, Bot, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const quickTiles = [
  { title: 'Events', icon: Calendar, href: '/events' },
  { title: 'Mentorship', icon: HeartHandshake, href: '/mentorship' },
  { title: 'Journal', icon: BookOpen, href: '/stories' },
  { title: 'Connect', icon: MessageSquare, href: '/connect' },
];

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
      stiffness: 100,
    },
  },
};

interface Highlight {
    id: string;
    author: string;
    avatar: string;
    content: string;
    dataAiHint?: string;
}

interface Broadcast {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
}

const broadcastIcons = {
    info: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
}

const broadcastStyles = {
    info: 'border-blue-500/50 text-blue-300 [&>svg]:text-blue-400',
    warning: 'border-yellow-500/50 text-yellow-300 [&>svg]:text-yellow-400',
    success: 'border-green-500/50 text-green-300 [&>svg]:text-green-400',
}

export default function DashboardPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const db = getFirestore(app);
        
        // Fetch highlights
        const storiesCollection = collection(db, 'stories');
        const storiesQuery = query(storiesCollection, orderBy('createdAt', 'desc'), limit(3));
        const storySnapshot = await getDocs(storiesQuery);
        const highlightsList = storySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                author: data.author,
                avatar: data.avatar,
                content: data.excerpt, // Use excerpt as highlight content
                dataAiHint: 'woman portrait',
            } as Highlight
        });
        setHighlights(highlightsList);

        // Fetch broadcasts
        const broadcastsCollection = collection(db, 'broadcasts');
        const broadcastsQuery = query(broadcastsCollection, orderBy('createdAt', 'desc'), limit(1)); // show latest
        const broadcastSnapshot = await getDocs(broadcastsQuery);
        const broadcastList = broadcastSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Broadcast));
        setBroadcasts(broadcastList);
        
        setLoading(false);
    };

    fetchData();
  }, []);

  const dismissBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter(b => b.id !== id));
    // In a real app, you might persist this dismissal per-user
  }


  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, Queen 👑`} description="Here's your daily dose of inspiration and what's new in the hub." />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {broadcasts.map(b => (
            <motion.div key={b.id} variants={itemVariants}>
                 <Alert className={cn('glass-card mb-8 relative pr-10', broadcastStyles[b.type])}>
                    {broadcastIcons[b.type]}
                    <AlertTitle className="font-headline">{b.title}</AlertTitle>
                    <AlertDescription>{b.message}</AlertDescription>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => dismissBroadcast(b.id)}>
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            </motion.div>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            {/* Affirmation Carousel */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Daily Affirmation</CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel opts={{ loop: true }}>
                  <CarouselContent>
                    {affirmations.map((affirmation, index) => (
                      <CarouselItem key={index}>
                        <p className="text-xl font-medium text-center p-6 h-32 flex items-center justify-center">
                          "{affirmation}"
                        </p>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </CardContent>
            </Card>

            {/* Highlights Feed */}
            <Card className="glass-card">
               <CardHeader>
                <CardTitle className="font-headline text-2xl">Hub Highlights</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  {loading ? (
                    Array.from({length: 2}).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))
                  ) : (
                    highlights.map((item) => (
                        <motion.div key={item.id} variants={itemVariants} className="p-4 rounded-lg bg-card/50 flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={item.avatar} alt={item.author} data-ai-hint={item.dataAiHint} />
                            <AvatarFallback>{item.author ? item.author.charAt(0) : 'C'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{item.author}</p>
                            <p className="text-sm text-foreground/80">{item.content}</p>
                        </div>
                        </motion.div>
                    ))
                  )}
               </CardContent>
            </Card>
          </motion.div>
          
          <motion.div className="space-y-8" variants={itemVariants}>
              {/* Quick Tiles */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div className="grid grid-cols-2 gap-4" variants={containerVariants}>
                    {quickTiles.map((tile) => (
                      <motion.div key={tile.href} variants={itemVariants}>
                        <Link href={tile.href}>
                            <div className="p-4 bg-card/50 rounded-lg flex flex-col items-center justify-center aspect-square text-center transition-all hover:bg-primary/20 hover:-translate-y-1">
                                <tile.icon className="h-8 w-8 text-primary mb-2" />
                                <p className="font-semibold">{tile.title}</p>
                            </div>
                        </Link>
                      </motion.div>
                    ))}
                </motion.div>
              </CardContent>
            </Card>

             {/* Floating Assistant */}
             <motion.div 
                className="relative p-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden border border-primary/30"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
            >
                <div className="absolute -right-4 -bottom-4">
                    <Bot className="h-24 w-24 text-primary/30 animate-pulse" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-headline text-xl text-primary">AI Assistant</h3>
                    <p className="text-sm text-foreground/80 mt-2">Need help finding a mentor or resource? I'm here to assist.</p>
                </div>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
