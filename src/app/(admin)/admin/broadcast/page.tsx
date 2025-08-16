
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadioTower, Send, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';

export default function BroadcastPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleSendBroadcast = async () => {
        if(!title || !message || !type) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill out all fields before sending a broadcast.',
                variant: 'destructive'
            });
            return;
        }
         if (user?.role !== 'admin') {
            toast({ title: "Permission Denied", description: "You are not authorized to perform this action.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const functions = getFunctions(app);
            const createBroadcast = httpsCallable(functions, 'createBroadcast');
            await createBroadcast({ title, message, type });

            toast({
                title: 'Broadcast Sent!',
                description: 'Your message has been sent to all users.',
            });
            setTitle('');
            setMessage('');
            setType('info');

        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Error Sending Broadcast',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };


  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Broadcast Center" description="Send system-wide announcements to all users." />

      <Card className="admin-glass-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2"><RadioTower /> New Broadcast</CardTitle>
          <CardDescription>This message will appear as a notification for all logged-in users on their dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="broadcast-title">Title</Label>
              <Input 
                id="broadcast-title" 
                placeholder="e.g. Scheduled Maintenance" 
                className="bg-slate-900/50 border-slate-700" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="broadcast-type" className="bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info"><div className="flex items-center gap-2"><Info className="h-4 w-4" />Info</div></SelectItem>
                  <SelectItem value="warning"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Warning</div></SelectItem>
                  <SelectItem value="success"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Success</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea 
                id="broadcast-message" 
                placeholder="The platform will be down for one hour at midnight..." 
                className="bg-slate-900/50 border-slate-700 min-h-[150px]" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
            <Button className="glow-button-accent ml-auto" onClick={handleSendBroadcast} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
                Send Broadcast
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
