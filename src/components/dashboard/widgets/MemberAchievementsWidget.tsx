// Member Achievements Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const achievements = [
  { name: "Community Builder", date: "2025-08-01" },
  { name: "Event Volunteer", date: "2025-07-15" },
  { name: "Top Connector", date: "2025-06-30" },
];

export default function MemberAchievementsWidget() {
  return (
    <Card className="glass-card animate-fade-in border-yellow-300">
      <CardHeader className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 animate-bounce" />
        <CardTitle className="text-yellow-600 font-bold">Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {achievements.map((a, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-yellow-50/60 border border-yellow-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-yellow-700">{a.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
