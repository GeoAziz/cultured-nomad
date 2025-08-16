
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Telescope, Wand2 } from "lucide-react";

export default function SeekerDashboard() {
  return (
    <Card className="glass-card bg-blue-500/10 border-blue-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-blue-300">Seeker Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-400">Your journey to mastery starts now. Find the guidance you need to soar.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg text-center">
                <Wand2 className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Find a Mentor</p>
                <p className="text-sm text-muted-foreground">AI-Powered Matching</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center">
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Set Your Goals</p>
                <p className="text-sm text-muted-foreground">Track Your Progress</p>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center">
                <Telescope className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Explore Resources</p>
                <p className="text-sm text-muted-foreground">Curated For You</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
