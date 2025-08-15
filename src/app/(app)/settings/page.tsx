"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // On component mount, check the class on <html>
        const root = window.document.documentElement;
        setIsDarkMode(root.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const root = window.document.documentElement;
        root.classList.toggle('dark');
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Settings" description="Customize your Cultured Nomads experience." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="font-headline">Appearance</CardTitle>
                            <CardDescription>Adjust the look and feel of the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dark-mode">Zizo Dark Mode™️</Label>
                                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleTheme} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="font-headline">Notifications</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="dm-notifs">Direct Messages</Label>
                                <Switch id="dm-notifs" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="event-notifs">Event Reminders</Label>
                                <Switch id="event-notifs" defaultChecked />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="sound-notifs">Notification Sounds</Label>
                                <Select defaultValue="sci-fi-beep-1">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select sound" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sci-fi-beep-1">Sci-fi Beep 1</SelectItem>
                                        <SelectItem value="sci-fi-beep-2">Sci-fi Beep 2</SelectItem>
                                        <SelectItem value="chime">Chime</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                 <motion.div 
                    className="lg:col-span-1 space-y-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="font-headline">Edit Profile</CardTitle>
                            <CardDescription>Keep your information up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{ rotateY: [0, 180, 360] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                >
                                    <Avatar className="w-24 h-24 mb-4">
                                        <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="woman portrait" />
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Aisha Khan" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="aisha@nexusai.com" />
                            </div>
                            <Button className="w-full glow-button">Save Changes</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
