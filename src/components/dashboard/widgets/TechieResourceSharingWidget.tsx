// Techie Resource Sharing Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const resources = [
  { title: "React Best Practices", url: "https://react.dev/", type: "Guide" },
  { title: "Node.js Cheat Sheet", url: "https://nodejs.org/", type: "Code" },
  { title: "Design Patterns", url: "https://refactoring.guru/", type: "Article" },
];

export default function TechieResourceSharingWidget() {
  return (
    <Card className="glass-card animate-fade-in border-blue-300">
      <CardHeader className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-blue-500 animate-pulse" />
        <CardTitle className="text-blue-600 font-bold">Resource Sharing</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.title} className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-700">{r.title}</span>
                <span className="px-2 py-1 rounded text-xs bg-indigo-200 text-indigo-700">{r.type}</span>
              </div>
              <a href={r.url} target="_blank" rel="noopener" className="text-xs text-blue-500 underline mt-1 block">View Resource</a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
