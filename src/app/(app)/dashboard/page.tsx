
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { affirmations } from '@/lib/mock-data';
import { Bot, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardContent from '@/components/dashboard/DashboardContent';


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
  const { user, loading: authLoading } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);
  
  const welcomeMessage = user ? `Welcome back, ${user.name} 👑` : 'Welcome, Nomad 👑';

  useEffect(() => {
    const fetchBroadcasts = async () => {
        setLoadingBroadcasts(true);
        try {
            const db = getFirestore(app);
            const broadcastsCollection = collection(db, 'broadcasts');
            const broadcastsQuery = query(broadcastsCollection, orderBy('createdAt', 'desc'), limit(1));
            const broadcastSnapshot = await getDocs(broadcastsQuery);
            const broadcastList = broadcastSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Broadcast));
            setBroadcasts(broadcastList);
        } catch (error) {
            console.error("Error fetching broadcasts:", error);
        } finally {
            setLoadingBroadcasts(false);
        }
    };

    fetchBroadcasts();
  }, []);

  const dismissBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter(b => b.id !== id));
  }


  return (
    <div className="space-y-8">
      <PageHeader title={welcomeMessage} description="Here's your daily dose of inspiration and what's new in the hub." />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {loadingBroadcasts ? <Skeleton className="h-24 w-full" /> : (
            broadcasts.map(b => (
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
            ))
        )}
        
        {/* Main Dashboard Content */}
        {authLoading ? (
            <Skeleton className="h-96 w-full" />
        ) : (
             <DashboardContent user={user} />
        )}


        {/* Shared Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
          </motion.div>
          
          <motion.div className="space-y-8" variants={itemVariants}>
             {/* Floating Assistant */}
             <motion.div 
                className="relative p-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden border border-primary/30 h-full flex flex-col justify-center"
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
