// Member Dashboard Component
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MemberCommunityFeedWidget from "@/components/dashboard/widgets/MemberCommunityFeedWidget";
import MemberEventCalendarWidget from "@/components/dashboard/widgets/MemberEventCalendarWidget";
import MemberConnectionsWidget from "@/components/dashboard/widgets/MemberConnectionsWidget";
import MemberOpportunitiesWidget from "@/components/dashboard/widgets/MemberOpportunitiesWidget";
import MemberAchievementsWidget from "@/components/dashboard/widgets/MemberAchievementsWidget";
import MemberSupportCenterWidget from "@/components/dashboard/widgets/MemberSupportCenterWidget";

export default function MemberDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-green-600 animate-bounce">Member Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-lg">Welcome, Member! Explore community events, connect, and discover new opportunities.</div>
        </CardContent>
      </Card>
      <MemberCommunityFeedWidget />
      <MemberEventCalendarWidget />
      <MemberConnectionsWidget />
      <MemberOpportunitiesWidget />
      <MemberAchievementsWidget />
      <MemberSupportCenterWidget />
    </div>
  );
}
