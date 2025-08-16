
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Share2, Puzzle } from "lucide-react";
import { Button } from "../ui/button";

export default function TechieDashboard() {
  return (
    <Card className="glass-card bg-purple-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-purple-300">Techie Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-purple-400">Showcase your skills, contribute to projects, and discover new tech.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-lg">Project Showcase</p>
                <p className="text-sm text-muted-foreground mb-3">Highlight Your Work</p>
                <Button className="glow-button" size="sm">Add Project</Button>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <Share2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-lg">Share Resources</p>
                <p className="text-sm text-muted-foreground mb-3">Contribute to the Hub</p>
                <Button variant="outline" size="sm">Share Link</Button>
            </div>
             <div className="p-4 bg-card/50 rounded-lg text-center transition-all hover:bg-primary/10 hover:-translate-y-1">
                <Puzzle className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-bold text-lg">Find Bounties</p>
                <p className="text-sm text-muted-foreground mb-3">Collaborate & Innovate</p>
                <Button variant="outline" size="sm">Browse Bounties</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
