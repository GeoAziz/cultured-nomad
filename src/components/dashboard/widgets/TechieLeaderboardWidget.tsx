// Techie Leaderboard Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

const leaderboard = [
  { name: "Techie One", points: 120 },
  { name: "Techie Two", points: 95 },
  { name: "Mentor Kristi", points: 80 },
];

export default function TechieLeaderboardWidget() {
  return (
    <Card className="glass-card animate-fade-in border-yellow-300">
      <CardHeader className="flex items-center gap-2">
        <Award className="h-5 w-5 text-yellow-500 animate-bounce" />
        <CardTitle className="text-yellow-600 font-bold">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {leaderboard.map((l, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-yellow-50/60 border border-yellow-100 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-700">{l.name}</span>
                <span className="px-2 py-1 rounded text-xs bg-yellow-200 text-yellow-700">{l.points} pts</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
