
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase_config';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const moods = [
    { emoji: '🎉', label: 'Celebrating' },
    { emoji: '🚀', label: 'Productive' },
    { emoji: '😌', label: 'Relaxed' },
    { emoji: '🤔', label: 'Reflective' },
    { emoji: '😫', label: 'Overwhelmed' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function WellnessPage() {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [winOfTheDay, setWinOfTheDay] = useState('');
    const [journalEntry, setJournalEntry] = useState('');
    const [journalPrompt, setJournalPrompt] = useState("Loading your daily prompt...");
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const functions = getFunctions(app);
                const getDailyPrompt = httpsCallable(functions, 'getDailyPrompt');
                const result: any = await getDailyPrompt();
                setJournalPrompt(result.data.prompt);
            } catch (error) {
                console.error("Error fetching daily prompt", error);
                setJournalPrompt("What's one small step you took today that you're proud of, and why did it matter?"); // Fallback prompt
            }
        };
        if (user) fetchPrompt();
    }, [user]);


    const handleLogMood = async (mood: string, notes?: string) => {
        if (!user) {
            toast({ title: "Please log in to use this feature.", variant: "destructive"});
            return;
        }
        const loadingKey = notes ? 'win' : mood;
        setLoading(prev => ({ ...prev, [loadingKey]: true }));
        try {
            const functions = getFunctions(app);
            const logMoodFn = httpsCallable(functions, 'logMood');
            const result: any = await logMoodFn({ mood, notes });

            toast({
                title: `Feeling ${mood.toLowerCase()} logged!`,
                description: result.data.quote,
            });
            if (notes) setWinOfTheDay('');
            if (!notes) setSelectedMood(mood);

        } catch (error: any) {
            console.error("Error logging mood:", error);
            toast({
                title: 'Error',
                description: error.message || "Couldn't log your mood. Please try again.",
                variant: 'destructive',
            })
        } finally {
             setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleSelectMood = (mood: string) => {
        handleLogMood(mood);
    }

    const handleLogWin = () => {
        if (!winOfTheDay.trim()) {
            toast({ title: "Please enter your win.", variant: "destructive" });
            return;
        }
        handleLogMood('Win', winOfTheDay);
    };

    const handleSaveJournal = () => {
        setLoading(prev => ({ ...prev, journal: true }));
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Journal Entry Saved",
                description: "Your thoughts have been recorded."
            });
            setJournalEntry('');
            setLoading(prev => ({ ...prev, journal: false }));
        }, 1000)
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Wellness Corner" description="Nourish your mind. Celebrate your journey." />

            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="space-y-8" variants={itemVariants}>
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">How are you feeling today?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-around">
                                {moods.map(mood => (
                                    <motion.button
                                        key={mood.label}
                                        onClick={() => handleSelectMood(mood.label)}
                                        className="flex flex-col items-center gap-2 text-foreground/80 relative"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        disabled={loading[mood.label]}
                                    >
                                        <span className="text-4xl p-4 bg-card/50 rounded-full">{mood.emoji}</span>
                                        <span className="text-sm">{mood.label}</span>
                                        {selectedMood === mood.label && (
                                            <motion.div
                                                layoutId="mood-ring"
                                                className="absolute inset-0 rounded-full border-2 border-primary"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1.1 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            />
                                        )}
                                        {loading[mood.label] && <Loader2 className="absolute top-5 animate-spin"/>}
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Log your Win of the Day</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            <Input 
                                placeholder="e.g., Nailed my presentation!"
                                value={winOfTheDay}
                                onChange={e => setWinOfTheDay(e.target.value)}
                                disabled={loading['win']}
                             />
                            <Button className="glow-button" onClick={handleLogWin} disabled={loading['win']}>
                                {loading['win'] ? <Loader2 className="animate-spin" /> : 'Log Win'}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div className="space-y-8" variants={itemVariants}>
                     <Card className="glass-card h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Guided Reflection</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                           <p className="italic text-foreground/80 mb-4">{journalPrompt}</p>
                           <Textarea 
                                placeholder="Your thoughts..." 
                                className="flex-1 bg-card/50"
                                value={journalEntry}
                                onChange={(e) => setJournalEntry(e.target.value)}
                                disabled={loading['journal']}
                            />
                           <Button className="glow-button-accent mt-4 self-end" onClick={handleSaveJournal} disabled={loading['journal']}>
                             {loading['journal'] ? <Loader2 className="animate-spin" /> : 'Save Entry'}
                           </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <Card className="glass-card">
                         <CardHeader>
                            <CardTitle className="font-headline text-2xl">Mini Meditations</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">5-Minute Focus Boost</h3>
                                <p className="text-sm text-foreground/70">A quick reset for a busy mind.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button size="icon" variant="ghost"><SkipBack/></Button>
                                <Button size="icon" className="w-16 h-16 glow-button"><Play className="h-8 w-8"/></Button>
                                <Button size="icon" variant="ghost"><SkipForward/></Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
