
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, HeartHandshake, MessageSquare, Users, CalendarClock, GraduationCap, Target, Telescope, Wand2, Code, Share2, Puzzle } from "lucide-react";
import Link from "next/link";
import { UserProfile, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MentorStats } from "@/types/mentorship";
import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/firebase_config";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

interface DashboardContentProps {
    user: UserProfile | null;
}

const quickTiles = [
    { title: 'Events', icon: Calendar, href: '/events' },
    { title: 'Mentorship', icon: HeartHandshake, href: '/mentorship' },
    { title: 'Journal', icon: BookOpen, href: '/stories' },
    { title: 'Connect', icon: MessageSquare, href: '/connect' },
];

const MemberDashboard = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTiles.map((tile) => (
                <Link key={tile.href} href={tile.href}>
                    <div className="p-4 bg-card/50 rounded-lg flex flex-col items-center justify-center aspect-square text-center transition-all hover:bg-primary/20 hover:-translate-y-1">
                        <tile.icon className="h-8 w-8 text-primary mb-2" />
                        <p className="font-semibold">{tile.title}</p>
                    </div>
                </Link>
            ))}
        </div>
      </CardContent>
    </Card>
);

const MentorDashboard = ({ user }: { user: UserProfile }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<MentorStats>({
    pendingRequests: 0,
    activeMentees: 0,
    totalSessions: 0,
    upcomingSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const db = getFirestore(app);
        const mentorshipsRef = collection(db, 'mentorships');
        
        // Get active mentees
        const activeMenteesQuery = query(
          mentorshipsRef,
          where('mentorId', '==', user.uid),
          where('status', '==', 'active')
        );
        const activeSnapshot = await getDocs(activeMenteesQuery);
        const activeMentees = activeSnapshot.size;

        // Get pending requests
        const pendingQuery = query(
          mentorshipsRef,
          where('mentorId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingRequests = pendingSnapshot.size;

        // Get upcoming sessions (you may need to adjust this based on your data structure)
        const now = new Date();
        const sessionsRef = collection(db, 'sessions');
        const upcomingQuery = query(
          sessionsRef,
          where('mentorId', '==', user.uid),
          where('date', '>', now)
        );
        const upcomingSnapshot = await getDocs(upcomingQuery);
        const upcomingSessions = upcomingSnapshot.size;

        // Get total sessions
        const totalSessionsQuery = query(
          sessionsRef,
          where('mentorId', '==', user.uid)
        );
        const totalSessionsSnapshot = await getDocs(totalSessionsQuery);
        const totalSessions = totalSessionsSnapshot.size;

        setStats({
          activeMentees,
          pendingRequests,
          upcomingSessions,
          totalSessions
        });
      } catch (error: any) {
        console.error("Error fetching mentor stats:", error);
        toast({
          title: "Error Fetching Stats",
          description: error.message || "Could not fetch your mentor statistics.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast, user?.uid]);

  return (
    <Card className="glass-card bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Mentor Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Active Mentees" value={stats.activeMentees} loading={loading} />
          <StatCard icon={CalendarClock} label="Pending Requests" value={stats.pendingRequests} loading={loading} />
          <StatCard icon={GraduationCap} label="Total Sessions" value={stats.totalSessions} loading={loading} />
          <StatCard icon={Calendar} label="Upcoming Sessions" value={stats.upcomingSessions} loading={loading} />
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ icon: Icon, label, value, loading }: { icon: React.ElementType, label: string, value: number, loading: boolean }) => (
  <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
    <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
    {loading ? (
      <Skeleton className="h-8 w-1/2 mx-auto mb-1" />
    ) : (
      <p className="font-bold text-2xl">{value}</p>
    )}
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const SeekerDashboard = () => (
    <Card className="glass-card bg-blue-500/10 border-blue-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-blue-300">Seeker Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-400">Your journey to mastery starts now. Find the guidance you need to soar.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionTile icon={Wand2} title="Find a Mentor" description="AI-Powered Matching" buttonText="Begin Search" href="/mentorship"/>
            <ActionTile icon={Target} title="Set Your Goals" description="Track Your Progress" buttonText="Define Goals" href="/profile" />
            <ActionTile icon={Telescope} title="Explore Resources" description="Curated For You" buttonText="Browse" href="/stories" />
        </div>
      </CardContent>
    </Card>
);

const TechieDashboard = () => (
    <Card className="glass-card bg-purple-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-purple-300">Techie Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-purple-400">Showcase your skills, contribute to projects, and discover new tech.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionTile icon={Code} title="Project Showcase" description="Highlight Your Work" buttonText="Add Project" href="/profile" />
            <ActionTile icon={Share2} title="Share Resources" description="Contribute to the Hub" buttonText="Share Link" href="/stories/new" />
            <ActionTile icon={Puzzle} title="Find Bounties" description="Collaborate & Innovate" buttonText="Browse Bounties" href="#" />
        </div>
      </CardContent>
    </Card>
);

const ActionTile = ({ icon: Icon, title, description, buttonText, href }: { icon: React.ElementType, title: string, description: string, buttonText: string, href: string }) => (
  <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-accent/10 hover:-translate-y-1 flex flex-col justify-between">
    <div>
        <Icon className="h-8 w-8 text-accent mx-auto mb-2" />
        <p className="font-bold text-lg">{title}</p>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
    </div>
    <Link href={href} passHref>
      <Button variant="outline" size="sm">{buttonText}</Button>
    </Link>
  </div>
);


export default function DashboardContent({ user }: DashboardContentProps) {
    if (!user) {
        return <MemberDashboard />; // Fallback for logged-out or loading states
    }

    switch (user.role) {
        case 'MENTOR':
            return <MentorDashboard user={user} />;
        case 'SEEKER':
            return <SeekerDashboard />;
        case 'TECHIE':
            return <TechieDashboard />;
        case 'ADMIN':
        case 'MEMBER':
        default:
            return <MemberDashboard />;
    }
}
