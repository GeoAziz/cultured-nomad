
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Telescope, Wand2 } from "lucide-react";
import { Button } from "../ui/button";

export default function SeekerDashboard() {
  return (
    <Card className="glass-card bg-blue-500/10 border-blue-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-blue-300">Seeker Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-400">Your journey to mastery starts now. Find the guidance you need to soar.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-accent/10 hover:-translate-y-1">
                <Wand2 className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Find a Mentor</p>
                <p className="text-sm text-muted-foreground mb-3">AI-Powered Matching</p>
                <Button variant="outline" size="sm" className="glow-button-accent">Begin Search</Button>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-accent/10 hover:-translate-y-1">
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Set Your Goals</p>
                <p className="text-sm text-muted-foreground mb-3">Track Your Progress</p>
                 <Button variant="outline" size="sm">Define Goals</Button>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-accent/10 hover:-translate-y-1">
                <Telescope className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-bold text-lg">Explore Resources</p>
                <p className="text-sm text-muted-foreground mb-3">Curated For You</p>
                 <Button variant="outline" size="sm">Browse</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
