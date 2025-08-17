"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';

interface AnalyticsData {
  engagementMetrics: any[];
  growthMetrics: any[];
  roleSpecificMetrics: any[];
}

export default function RoleAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    engagementMetrics: [],
    growthMetrics: [],
    roleSpecificMetrics: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.uid) return;

      const db = getFirestore(app);
      
      // Fetch role-specific metrics
      const metricsQuery = query(
        collection(db, `analytics/${user.role}/metrics`),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(metricsQuery);
      const metrics = snapshot.docs.map(doc => doc.data());

      setData(prev => ({
        ...prev,
        roleSpecificMetrics: metrics,
      }));
    };

    fetchAnalytics();
  }, [user]);

  const renderRoleSpecificChart = () => {
    switch (user?.role) {
      case 'mentor':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Impact</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.roleSpecificMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessionsCompleted" fill="#8884d8" />
                  <Bar dataKey="menteeProgress" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'seeker':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.roleSpecificMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="skillProgress" stroke="#8884d8" />
                  <Line type="monotone" dataKey="goalsAchieved" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'techie':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Technical Contributions</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.roleSpecificMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projectContributions" fill="#8884d8" />
                  <Bar dataKey="resourcesShared" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Community Engagement</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.roleSpecificMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="interactions" stroke="#8884d8" />
                  <Line type="monotone" dataKey="connections" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderRoleSpecificChart()}
    </div>
  );
}
