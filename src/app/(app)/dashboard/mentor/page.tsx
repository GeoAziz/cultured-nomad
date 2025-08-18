
"use client";

import MentorDashboardStats from "@/components/dashboard/widgets/MentorDashboardStats";
import PendingRequestsWidget from "@/components/dashboard/widgets/PendingRequestsWidget";
import UpcomingSessionsWidget from "@/components/dashboard/widgets/UpcomingSessionsWidget";
import EventsWidget from "@/components/dashboard/widgets/EventsWidget";
import StoriesWidget from "@/components/dashboard/widgets/StoriesWidget";

export default function MentorDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-8">
        <MentorDashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UpcomingSessionsWidget />
            <PendingRequestsWidget />
        </div>
        <StoriesWidget />
      </div>

      {/* Right Sidebar Column */}
      <div className="lg:col-span-1 space-y-8">
        <EventsWidget />
      </div>
    </div>
  );
}
