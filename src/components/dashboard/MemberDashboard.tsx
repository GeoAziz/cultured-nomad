
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, HeartHandshake, MessageSquare } from "lucide-react";
import Link from "next/link";

const quickTiles = [
    { title: 'Events', icon: Calendar, href: '/events' },
    { title: 'Mentorship', icon: HeartHandshake, href: '/mentorship' },
    { title: 'Journal', icon: BookOpen, href: '/stories' },
    { title: 'Connect', icon: MessageSquare, href: '/connect' },
];

export default function MemberDashboard() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTiles.map((tile) => (
                <Link key={tile.href} href={tile.href}>
                    <div className="p-4 bg-card/50 rounded-lg flex flex-col items-center justify-center aspect-square text-center transition-all hover:bg-primary/20 hover:-translate-y-1">
                        <tile.icon className="h-8 w-8 text-primary mb-2" />
                        <p className="font-semibold">{tile.title}</p>
                    </div>
                </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
