// Techie Collaboration Requests Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const requests = [
  { requester: "Mentor: Kristi Waelchi", topic: "AI Chatbot Help", status: "Open" },
  { requester: "Member: Alice Smith", topic: "Mobile App Review", status: "Open" },
  { requester: "Mentor: Randall Fay", topic: "Web3 Integration", status: "Closed" },
];

export default function TechieCollaborationRequestsWidget() {
  return (
    <Card className="glass-card animate-fade-in border-blue-300">
      <CardHeader className="flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-500 animate-pulse" />
        <CardTitle className="text-blue-600 font-bold">Collaboration Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {requests.map((r, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-700">{r.requester}</span>
                <span className={`px-2 py-1 rounded text-xs ${r.status === 'Open' ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{r.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Topic: {r.topic}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
