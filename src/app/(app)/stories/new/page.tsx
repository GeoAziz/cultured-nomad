
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, PenSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';

const moods = ['Wins', 'Fails', 'Lessons', 'Real Talk'];

export default function NewStoryPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    const handleTagChange = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (!title || !content || selectedTags.length === 0) {
            toast({
                title: "Missing Fields",
                description: "Please provide a title, content, and at least one tag.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const db = getFirestore(app);
            if (!user?.uid) throw new Error('User not authenticated');
            await addDoc(collection(db, 'stories'), {
                title,
                content,
                tags: selectedTags,
                isAnonymous,
                userId: user.uid,
                author: isAnonymous ? "Anonymous Nomad" : user.name || "A Nomad",
                avatar: isAnonymous ? "https://placehold.co/50x50.png" : user.avatar || "https://placehold.co/50x50.png",
                createdAt: serverTimestamp(),
                likes: 0,
                commentCount: 0,
            });
            toast({
                title: "Story Published!",
                description: "Your story is now live for the sisterhood to see."
            });
            router.push('/stories');
        } catch (error: any) {
            console.error("Error publishing story:", error);
            toast({
                title: "Publishing Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <PageHeader title="New Journal Entry" description="Share your voice. Your story matters here." />

            <Card className="glass-card max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <PenSquare className="text-primary"/>
                        Compose Your Story
                    </CardTitle>
                    <CardDescription>
                        Write about your experiences, challenges, and victories. You can choose to share anonymously.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-lg">Title</Label>
                        <Input 
                            id="title"
                            placeholder="e.g., My First Angel Investment Pitch"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="content" className="text-lg">Your Story</Label>
                        <Textarea 
                            id="content"
                            placeholder="It all started when..."
                            className="min-h-[250px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label className="text-lg">Tags</Label>
                        <p className="text-sm text-muted-foreground">Select one or more tags that fit your story.</p>
                        <div className="flex flex-wrap gap-4 pt-2">
                           {moods.map(mood => (
                               <div key={mood} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={mood} 
                                        onCheckedChange={() => handleTagChange(mood)}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor={mood}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {mood}
                                    </label>
                                </div>
                           ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <Switch 
                            id="anonymous-mode" 
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                            disabled={loading}
                        />
                        <Label htmlFor="anonymous-mode" className="text-lg">Post Anonymously</Label>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        If you post anonymously, your name and avatar will be hidden from the story.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="ml-auto glow-button-accent">
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        Publish Story
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
