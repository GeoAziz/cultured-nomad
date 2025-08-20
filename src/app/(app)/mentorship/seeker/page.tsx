"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserIcon, CalendarIcon, MessageCircle, CheckCircle2 } from 'lucide-react';
import { collection, query, where, onSnapshot, getFirestore, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';

type Mentorship = {
    id: string;
    mentorName: string;
    status: string;
    startedAt: Date | null;
    lastMessage: string;
};

function MentorshipSeekerPage() {
    const { user } = useAuth();
    const [mentorships, setMentorships] = useState<Mentorship[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || user.role.toUpperCase() !== 'SEEKER') {
            setMentorships([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const db = getFirestore(app);
        const mentorshipsCollection = collection(db, 'mentorships');
        const q = query(
            mentorshipsCollection,
            where('userId', '==', user.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    mentorName: data.mentorName || 'Mentor',
                    status: data.status || 'pending',
                    startedAt: data.startedAt ? (data.startedAt as Timestamp).toDate() : null,
                    lastMessage: data.lastMessage || '',
                };
            });
            setMentorships(list);
            setLoading(false);
        }, (error) => {
            toast({
                title: 'Error Loading Mentorships',
                description: error.message,
                variant: 'destructive'
            });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="h-[calc(100vh-8rem)]">
            <PageHeader title="Your Mentorships" description="Track and manage your mentorship relationships." />
            <Card className="glass-card p-6 mt-6">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                ) : mentorships.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <UserIcon className="mx-auto mb-2 h-8 w-8" />
                        <p>No mentorships found. Start connecting with mentors!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mentorships.map(m => (
                            <div key={m.id} className="p-4 rounded-lg bg-card/50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{m.mentorName}</h3>
                                    <p className="text-sm text-foreground/70">Status: {m.status}</p>
                                    {m.startedAt && (
                                        <p className="text-xs text-foreground/50">Started {formatDistanceToNowStrict(m.startedAt)} ago</p>
                                    )}
                                    {m.lastMessage && (
                                        <p className="text-xs text-foreground/50 mt-1"><MessageCircle className="inline h-4 w-4 mr-1" />{m.lastMessage}</p>
                                    )}
                                </div>
                                <div>
                                    {m.status === 'active' ? (
                                        <CheckCircle2 className="text-green-500 h-6 w-6" />
                                    ) : (
                                        <CalendarIcon className="text-blue-500 h-6 w-6" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function MentorshipSeekerPageWrapper() {
    return (
        <AuthGuard requiredRole="SEEKER">
            <MentorshipSeekerPage />
        </AuthGuard>
    );
}
