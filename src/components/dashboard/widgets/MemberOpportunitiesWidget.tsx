// Member Opportunities Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

const opportunities = [
  { title: "Volunteer at Local Event", type: "Volunteer" },
  { title: "Frontend Developer Internship", type: "Job" },
  { title: "Online Course: Leadership", type: "Learning" },
];

export default function MemberOpportunitiesWidget() {
  return (
    <Card className="glass-card animate-fade-in border-green-300">
      <CardHeader className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-green-500 animate-bounce" />
        <CardTitle className="text-green-600 font-bold">Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {opportunities.map((o, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-green-50/60 border border-green-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-green-700">{o.title}</span>
              <span className="ml-2 px-2 py-1 rounded text-xs bg-green-200 text-green-700">{o.type}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
