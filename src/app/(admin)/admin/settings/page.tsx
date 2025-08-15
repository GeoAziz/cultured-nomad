"use client";

import { motion } from 'framer-motion';
import { Power, Bell, Users, DatabaseZap } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="System Settings" description="Configure global platform parameters and controls." />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
                <Card className="admin-glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><Power /> Platform Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
                            <Label htmlFor="maintenance-mode" className="text-lg">Maintenance Mode</Label>
                            <Switch id="maintenance-mode" className="data-[state=checked]:bg-red-500" />
                        </div>
                        <p className="text-sm text-slate-400 mt-2">When enabled, the public-facing site will be disabled, but the admin panel will remain accessible.</p>
                    </CardContent>
                </Card>

                <Card className="admin-glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><Bell /> System-Wide Announcement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div>
                            <Label htmlFor="announcement-title">Title</Label>
                            <Input id="announcement-title" placeholder="e.g. Scheduled Maintenance" className="bg-slate-900/50 border-slate-700" />
                       </div>
                        <div>
                            <Label htmlFor="announcement-message">Message</Label>
                            <Textarea id="announcement-message" placeholder="The platform will be down for scheduled maintenance..." className="bg-slate-900/50 border-slate-700" />
                       </div>
                        <Button className="glow-button-accent">Broadcast Announcement</Button>
                    </CardContent>
                </Card>
            </div>

             {/* Right Column */}
            <div className="space-y-8">
                 <Card className="admin-glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><Users /> Manage Admin Users</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex gap-2">
                         <Input placeholder="new.admin@zizo.net" className="bg-slate-900/50 border-slate-700" />
                         <Button>Add Admin</Button>
                       </div>
                       <ul className="space-y-2 text-slate-300">
                         <li className="flex justify-between items-center p-2 rounded bg-slate-900/50"><span>operator@zizo.net</span> <Button variant="destructive" size="sm">Remove</Button></li>
                         <li className="flex justify-between items-center p-2 rounded bg-slate-900/50"><span>supervisor@zizo.net</span> <Button variant="destructive" size="sm">Remove</Button></li>
                       </ul>
                    </CardContent>
                </Card>
                 <Card className="admin-glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><DatabaseZap /> Data Management</CardTitle>
                        <CardDescription>Trigger manual data operations.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button variant="outline" className="flex-1 border-slate-600 hover:bg-slate-800">Trigger Full Backup</Button>
                        <Button variant="destructive" className="flex-1">Re-index Search</Button>
                    </CardContent>
                </Card>
            </div>
       </div>

    </motion.div>
  );
}
