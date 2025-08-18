
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, 
    CalendarClock, 
    BookCheck,
    Calendar,
    GraduationCap
} from "lucide-react";
import { useEffect, useState } from "react";
// Update the path below to match the actual location and filename of your useAuth hook
// Update the path below to match the actual location and filename of your useAuth hook
// Update the path below to match the actual location and filename of your useAuth hook
// Update the path below to match the actual location and filename of your useAuth hook
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/firebase_config";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

import { MentorStats } from "@/types/mentorship";

export default function MentorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<MentorStats>({
    pendingRequests: 0,
    activeMentees: 0,
    totalSessions: 0,
    upcomingSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'mentor') {
        const fetchStats = async () => {
            setLoading(true);
            console.log(`[MentorDashboard] Fetching stats for user: ${user.uid}`);
      try {
        const db = getFirestore(app);
        // Fetch mentorship stats
        // Only fetch mentorships where mentorId matches the logged-in user
        const mentorshipsRef = collection(db, "mentorships");
        const sessionsRef = collection(db, "mentoring_sessions");

        const pendingQuery = query(mentorshipsRef, where('mentorId', '==', user.uid), where('status', '==', 'pending'));
        const acceptedQuery = query(mentorshipsRef, where('mentorId', '==', user.uid), where('status', '==', 'accepted'));
        const totalSessionsQuery = query(sessionsRef, where('mentorId', '==', user.uid));
        const upcomingSessionsQuery = query(sessionsRef, where('mentorId', '==', user.uid), where('startTime', '>', new Date()));

        const [pendingSnapshot, acceptedSnapshot, totalSessionsSnapshot, upcomingSessionsSnapshot] = await Promise.all([
          getDocs(pendingQuery),
          getDocs(acceptedQuery),
          getDocs(totalSessionsQuery),
          getDocs(upcomingSessionsQuery)
        ]);

        setStats({
          pendingRequests: pendingSnapshot.size,
          activeMentees: acceptedSnapshot.size,
          totalSessions: totalSessionsSnapshot.size,
          upcomingSessions: upcomingSessionsSnapshot.size,
        });
      } catch (error: any) {
        console.error("[MentorDashboard] Error fetching mentor stats:", error);
        toast({
          title: "Error Fetching Stats",
          description: error.message || "Could not fetch your mentor statistics. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
        };
        fetchStats();
    } else {
        setLoading(false);
    }
  }, [user, toast]);

  if (!user || user.role !== 'mentor') return null;

  return (
    <Card className="glass-card bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Mentor Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-1/2 mx-auto mb-1" />
            ) : (
              <p className="font-bold text-2xl">{stats.activeMentees}</p>
            )}
            <p className="text-sm text-muted-foreground">Active Mentees</p>
          </div>

          <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
            <CalendarClock className="h-8 w-8 text-primary mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-1/2 mx-auto mb-1" />
            ) : (
              <p className="font-bold text-2xl">{stats.pendingRequests}</p>
            )}
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </div>

          <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
            <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-1/2 mx-auto mb-1" />
            ) : (
              <p className="font-bold text-2xl">{stats.totalSessions}</p>
            )}
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>

          <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-1/2 mx-auto mb-1" />
            ) : (
              <p className="font-bold text-2xl">{stats.upcomingSessions}</p>
            )}
            <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
