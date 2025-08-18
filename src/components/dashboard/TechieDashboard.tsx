// Techie Dashboard Component
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TechieProjectBoardWidget from "@/components/dashboard/widgets/TechieProjectBoardWidget";
import TechieResourceSharingWidget from "@/components/dashboard/widgets/TechieResourceSharingWidget";
import TechieEventsWidget from "@/components/dashboard/widgets/TechieEventsWidget";
import TechieCollaborationRequestsWidget from "@/components/dashboard/widgets/TechieCollaborationRequestsWidget";
import TechieLeaderboardWidget from "@/components/dashboard/widgets/TechieLeaderboardWidget";
import TechieChatWidget from "@/components/dashboard/widgets/TechieChatWidget";

export default function TechieDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-blue-600 animate-bounce">Techie Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-lg">Welcome, Techie! Here you can share resources, join projects, and connect with other innovators.</div>
        </CardContent>
      </Card>
      <TechieProjectBoardWidget />
      <TechieResourceSharingWidget />
      <TechieEventsWidget />
      <TechieCollaborationRequestsWidget />
      <TechieLeaderboardWidget />
      <TechieChatWidget />
    </div>
  );
}
