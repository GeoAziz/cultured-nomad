
"use client";

import SeekerMatchWidget from "@/components/dashboard/widgets/SeekerMatchWidget";
import SeekerGoalsWidget from "@/components/dashboard/widgets/SeekerGoalsWidget";
import EventsWidget from "@/components/dashboard/widgets/EventsWidget";
import StoriesWidget from "@/components/dashboard/widgets/StoriesWidget";

export default function SeekerDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-8">
        <SeekerMatchWidget />
        <SeekerGoalsWidget />
      </div>

      {/* Right Sidebar Column */}
      <div className="lg:col-span-1 space-y-8">
        <EventsWidget />
        <StoriesWidget />
      </div>
    </div>
  );
}
