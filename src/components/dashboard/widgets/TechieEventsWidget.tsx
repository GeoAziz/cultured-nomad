// Techie Events Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const events = [
  { name: "Hackathon 2025", date: "2025-09-10", type: "Hackathon" },
  { name: "Web3 Workshop", date: "2025-09-18", type: "Workshop" },
  { name: "AI Webinar", date: "2025-09-25", type: "Webinar" },
];

export default function TechieEventsWidget() {
  return (
    <Card className="glass-card animate-fade-in border-blue-300">
      <CardHeader className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-500 animate-spin" />
        <CardTitle className="text-blue-600 font-bold">Techie Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.name} className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-700">{e.name}</span>
                <span className="px-2 py-1 rounded text-xs bg-cyan-200 text-cyan-700">{e.type}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(e.date).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
