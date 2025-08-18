// Member Support Center Widget
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  { question: "How do I join an event?", answer: "Go to the Event Calendar and click RSVP." },
  { question: "How do I connect with other members?", answer: "Use the Connections widget to find and message members." },
  { question: "Who do I contact for support?", answer: "Email support@culturednomad.com or use the contact form." },
];

export default function MemberSupportCenterWidget() {
  return (
    <Card className="glass-card animate-fade-in border-green-300">
      <CardHeader className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-green-500 animate-pulse" />
        <CardTitle className="text-green-600 font-bold">Support Center</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {faqs.map((f, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-green-50/60 border border-green-100 shadow-sm hover:scale-105 transition-transform">
              <span className="font-semibold text-green-700">Q: {f.question}</span>
              <div className="ml-2 text-xs text-muted-foreground">A: {f.answer}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
