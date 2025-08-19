
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, Calendar, BookOpen, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import type { MentorStats } from '@/types/mentorship';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon: Icon, label, value, loading }: { icon: React.ElementType, label: string, value: number, loading: boolean }) => (
    <Card className="glass-card transition-all hover:border-primary/50 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
          {loading ? (
              <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
      </CardContent>
    </Card>
);

export default function MentorDashboardStats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<MentorStats>({
    pendingRequests: 0,
    activeMentees: 0,
    totalSessions: 0,
    upcomingSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchMentorStats = async () => {
      setLoading(true);
      try {
        const db = getFirestore(app);
        const mentorId = user.uid;

        // Create a single batch of parallel queries
        const mentorshipsRef = collection(db, "mentorships");
        const sessionsRef = collection(db, "mentoring_sessions");

        // Create the queries with proper indexes
        const pendingQuery = query(
          mentorshipsRef,
          where('mentorId', '==', mentorId),
          where('status', '==', 'pending')
        );
        const acceptedQuery = query(
          mentorshipsRef,
          where('mentorId', '==', mentorId),
          where('status', '==', 'accepted')
        );
        const totalSessionsQuery = query(
          sessionsRef,
          where('mentorId', '==', mentorId)
        );
        const upcomingSessionsQuery = query(
          sessionsRef,
          where('mentorId', '==', mentorId),
          where('startTime', '>=', Timestamp.fromDate(new Date()))
        );

        // Execute all queries in parallel
        const [pendingSnapshot, acceptedSnapshot, totalSessionsSnapshot, upcomingSessionsSnapshot] = 
          await Promise.all([
            getDocs(pendingQuery),
            getDocs(acceptedQuery),
            getDocs(totalSessionsQuery),
            getDocs(upcomingSessionsQuery)
          ]);

        // Update stats
        setStats({
          pendingRequests: pendingSnapshot.size,
          activeMentees: acceptedSnapshot.size,
          totalSessions: totalSessionsSnapshot.size,
          upcomingSessions: upcomingSessionsSnapshot.size,
        });

      } catch (error: any) {
        console.error("Error fetching mentor stats:", error);
        toast({
          title: "Error fetching stats",
          description: error.message || "Could not retrieve your mentor statistics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorStats();
  }, [user, toast]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active Seekers" value={stats.activeMentees} loading={loading} />
        <StatCard icon={Calendar} label="Upcoming Sessions" value={stats.upcomingSessions} loading={loading} />
        <StatCard icon={BookOpen} label="Total Sessions" value={stats.totalSessions} loading={loading} />
        <StatCard icon={Star} label="Pending Requests" value={stats.pendingRequests} loading={loading} />
    </div>
  );
}
