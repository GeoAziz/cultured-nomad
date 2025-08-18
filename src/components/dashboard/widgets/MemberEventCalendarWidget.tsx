// Member Event Calendar Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const events = [
  { name: "Community Meetup", date: "2025-09-12" },
  { name: "Webinar: Growth Mindset", date: "2025-09-20" },
  { name: "Volunteer Day", date: "2025-09-28" },
];

export default function MemberEventCalendarWidget() {
  return (
    <Card className="glass-card animate-fade-in border-green-300">
      <CardHeader className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green-500 animate-spin" />
        <CardTitle className="text-green-600 font-bold">Event Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {events.map((e, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-green-50/60 border border-green-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-green-700">{e.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
