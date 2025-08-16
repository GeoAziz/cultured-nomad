
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarClock, BookCheck } from "lucide-react";

export default function MentorDashboard() {
  return (
    <Card className="glass-card bg-green-500/10 border-green-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-green-300">Mentor Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-green-400">Welcome, Mentor. Here are your tools to guide the next generation of leaders.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-2xl">5</p>
                <p className="text-sm text-muted-foreground">Active Mentees</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <CalendarClock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-2xl">3</p>
                <p className="text-sm text-muted-foreground">Pending Sessions</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <BookCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-2xl">12</p>
                <p className="text-sm text-muted-foreground">Shared Resources</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
