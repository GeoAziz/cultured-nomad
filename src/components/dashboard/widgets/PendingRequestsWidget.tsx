
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, UserPlus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Request {
    id: string;
    userName: string;
    userAvatar: string;
    message: string;
    createdAt: Date;
}

export default function PendingRequestsWidget() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchRequests = async () => {
            setLoading(true);
            const db = getFirestore(app);
            const requestsQuery = query(
                collection(db, 'mentorships'),
                where('mentorId', '==', user.uid),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc'),
                limit(2)
            );
            try {
                const snapshot = await getDocs(requestsQuery);
                const requestsList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: (data.createdAt as Timestamp).toDate(),
                    } as Request
                });
                setRequests(requestsList);
            } catch (error) {
                console.error("Error fetching pending requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Mentorship Requests</CardTitle>
        <CardDescription>Review and respond to new mentorship requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {loading ? (
             Array.from({length: 1}).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            ))
         ) : requests.length > 0 ? (
            requests.map(request => (
                <div key={request.id} className="p-2 rounded-lg hover:bg-primary/5">
                    <div className="flex items-start gap-3">
                        <Avatar>
                            <AvatarImage src={request.userAvatar} />
                            <AvatarFallback>{request.userName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{request.userName}</p>
                            <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/20"><X className="h-4 w-4" /> Decline</Button>
                        <Button size="sm" className="glow-button"><Check className="h-4 w-4" /> Accept</Button>
                    </div>
                </div>
            ))
         ) : (
            <p className="text-center text-muted-foreground py-4">No pending requests.</p>
         )}
        <Button variant="outline" className="w-full mt-4">Manage All Requests</Button>
      </CardContent>
    </Card>
  );
}
