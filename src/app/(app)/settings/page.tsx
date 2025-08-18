
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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            setIsDarkMode(root.classList.contains('dark'));
        }
        
        if(user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setBio((user as any).bio || '');
        }

    }, [user]);

    const toggleTheme = () => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.toggle('dark');
            setIsDarkMode(!isDarkMode);
        }
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const db = getFirestore(app);
            if (!user?.uid) throw new Error('User not authenticated');
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { name, bio });
            toast({
                title: 'Profile Updated',
                description: 'Your changes have been saved successfully.',
            });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

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
                            <CardTitle className="font-headline">Profile Information</CardTitle>
                            <CardDescription>Keep your information up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex flex-col items-center">
                                <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" size="sm" disabled>Change Avatar (soon)</Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={loading || authLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} disabled />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} disabled={loading || authLoading} className="min-h-[100px]" />
                            </div>
                            <Button onClick={handleSaveChanges} className="w-full glow-button" disabled={loading || authLoading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                            </Button>
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
                            <CardTitle className="font-headline">Appearance</CardTitle>
                            <CardDescription>Adjust the look and feel of the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dark-mode">Zizo Dark Mode™️</Label>
                                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleTheme} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sound-notifs">UI Sounds</Label>
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

                     <Card className="glass-card border-destructive/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Button variant="destructive" className="w-full">Delete Account</Button>
                           <p className="text-xs text-muted-foreground mt-2">This action is irreversible. All your data will be permanently deleted.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
