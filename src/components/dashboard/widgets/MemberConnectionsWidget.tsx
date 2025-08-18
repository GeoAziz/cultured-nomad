// Member Connections Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const connections = [
  { name: "Bob Seeker", sharedInterest: "Growth Mindset" },
  { name: "Techie Two", sharedInterest: "Web Development" },
  { name: "Mentor Kayla", sharedInterest: "Career Planning" },
];

export default function MemberConnectionsWidget() {
  return (
    <Card className="glass-card animate-fade-in border-green-300">
      <CardHeader className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-green-500 animate-pulse" />
        <CardTitle className="text-green-600 font-bold">Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {connections.map((c, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-green-50/60 border border-green-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-green-700">{c.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">Shared Interest: {c.sharedInterest}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
