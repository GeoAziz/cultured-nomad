// Member Community Feed Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const feed = [
  { author: "Alice Smith", content: "Excited for the upcoming event!" },
  { author: "Mentor Kristi", content: "New mentorship slots available." },
  { author: "Techie One", content: "Shared a new React guide." },
];

export default function MemberCommunityFeedWidget() {
  return (
    <Card className="glass-card animate-fade-in border-green-300">
      <CardHeader className="flex items-center gap-2">
        <Users className="h-5 w-5 text-green-500 animate-bounce" />
        <CardTitle className="text-green-600 font-bold">Community Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {feed.map((f, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-green-50/60 border border-green-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-green-700">{f.author}:</span> {f.content}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
