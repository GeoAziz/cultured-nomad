
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarClock, BookCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/firebase_config";
import { Skeleton } from "../ui/skeleton";

interface MentorStats {
    activeMentees: number;
    pendingRequests: number;
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MentorStats>({ activeMentees: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'mentor') {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const functions = getFunctions(app);
                const getMentorDashboardStats = httpsCallable(functions, 'getMentorDashboardStats');
                const result: any = await getMentorDashboardStats();
                setStats(result.data);
            } catch (error) {
                console.error("Error fetching mentor stats:", error);
                // Optionally set error state to show in UI
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    } else {
        setLoading(false);
    }
  }, [user]);

  return (
    <Card className="glass-card bg-green-500/10 border-green-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-green-300">Mentor Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-green-400">Welcome, Mentor. Here are your tools to guide the next generation of leaders.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                {loading ? <Skeleton className="h-8 w-1/4 mx-auto" /> : <p className="font-bold text-2xl">{stats.activeMentees}</p>}
                <p className="text-sm text-muted-foreground">Active Mentees</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <CalendarClock className="h-8 w-8 text-primary mx-auto mb-2" />
                {loading ? <Skeleton className="h-8 w-1/4 mx-auto" /> : <p className="font-bold text-2xl">{stats.pendingRequests}</p>}
                <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <BookCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-2xl">12</p>
                <p className="text-sm text-muted-foreground">Shared Resources</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
