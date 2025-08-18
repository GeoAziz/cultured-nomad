// Techie Project Board Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Rocket } from "lucide-react";

const projects = [
  { name: "Open Source CMS", status: "Active", members: 8 },
  { name: "AI Chatbot", status: "Recruiting", members: 5 },
  { name: "Mobile App", status: "Completed", members: 12 },
];

export default function TechieProjectBoardWidget() {
  return (
    <Card className="glass-card animate-fade-in border-blue-300">
      <CardHeader className="flex items-center gap-2">
        <Rocket className="h-5 w-5 text-blue-500 animate-bounce" />
        <CardTitle className="text-blue-600 font-bold">Project Board</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.name} className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-700">{p.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${p.status === 'Active' ? 'bg-green-200 text-green-700' : p.status === 'Recruiting' ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{p.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Members: {p.members}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
