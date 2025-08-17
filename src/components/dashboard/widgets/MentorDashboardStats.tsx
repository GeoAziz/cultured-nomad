"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, Calendar, BookOpen, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';

export default function MentorDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeMentees: 0,
    upcomingSessions: 0,
    resourcesShared: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchMentorStats = async () => {
      if (!user?.uid) return;
      
      const db = getFirestore(app);
      // Fetch mentee relationships
      const menteesQuery = query(
        collection(db, 'mentorship'),
        where('mentorId', '==', user.uid),
        where('status', '==', 'active')
      );
      
      const menteesSnapshot = await getDocs(menteesQuery);
      setStats(prev => ({ ...prev, activeMentees: menteesSnapshot.size }));
      
      // Add more stat queries here
    };

    fetchMentorStats();
  }, [user]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeMentees}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resources Shared</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.resourcesShared}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
