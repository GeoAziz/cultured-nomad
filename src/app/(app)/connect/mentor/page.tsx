
"use client";

import { useState, useEffect, useRef }from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Smile, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, getFirestore, query, where, onSnapshot, orderBy, Timestamp, addDoc, Unsubscribe, limit, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ChatUser {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
    dataAiHint?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unread?: number;
}

interface Message {
    id: string;
    content: string;
    timestamp: string;
    senderId: string;
    self: boolean;
    participants: string[];
}

function MentorConnectPage() {
    const { user } = useAuth();
    const [seekers, setSeekers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedSeeker, setSelectedSeeker] = useState<ChatUser | null>(null);
    const [loadingSeekers, setLoadingSeekers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

        // Fetch all users with the 'SEEKER' role
    useEffect(() => {
        console.log('Fetching seekers effect triggered', { user });
        if(!user || user.role.toUpperCase() !== 'MENTOR') {
            console.log('User validation failed', { user, roleCheck: { userRole: user?.role, expected: 'MENTOR' } });
            return;
        }

        setLoadingSeekers(true);
        console.log('Starting to fetch seekers');
        const db = getFirestore(app);
        const usersCollection = collection(db, 'users');
        // Query for both uppercase and lowercase seeker roles to be safe
        const q = query(
            usersCollection, 
            where('role', 'in', ['SEEKER', 'seeker'])
        );
        console.log('Query created for seekers', { query: 'role in ["SEEKER", "seeker"]' });        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log('Got seekers snapshot', { size: snapshot.size });
            const seekerList = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Processing seeker doc', { uid: data.uid, role: data.role });
                return {
                    id: data.uid,
                    name: data.name,
                    avatar: data.avatar,
                    dataAiHint: data.dataAiHint || '',
                    lastMessage: 'Start a conversation...',
                    lastMessageTime: '',
                    online: true, // Placeholder
                } as ChatUser;
            });
            console.log('Processed seekers list', { count: seekerList.length });
            setSeekers(seekerList);
            setLoadingSeekers(false);
        }, (error) => {
            console.error('Error in seekers snapshot:', error);
            setLoadingSeekers(false);
            toast({
                title: "Error Loading Seekers",
                description: error.message,
                variant: "destructive"
            });
        });
        return () => unsubscribe();
    }, [user]);

    // Select the first seeker by default once the list is loaded
    useEffect(() => {
        if (seekers.length > 0 && !selectedSeeker) {
            setSelectedSeeker(seekers[0]);
        }
    }, [seekers]);

   // Fetch last message for each seeker
   useEffect(() => {
    console.log('Fetching last messages effect triggered', { 
        hasUser: !!user, 
        seekersCount: seekers.length 
    });
    if (!user || seekers.length === 0) {
        console.log('Skipping last messages fetch', { 
            hasUser: !!user, 
            seekersCount: seekers.length 
        });
        return;
    }
    const db = getFirestore(app);
    console.log('Starting to fetch last messages for seekers');

    const unsubscribes = seekers.map(seeker => {
        const messagesCollection = collection(db, 'messages');
        const q = query(
            messagesCollection,
            where('participants', 'array-contains', user.uid),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            const lastMsg = snapshot.docs
                .map(doc => doc.data())
                .filter(data => data.participants.includes(seeker.id))
                .sort((a, b) => b.timestamp?.toMillis?.() - a.timestamp?.toMillis?.())[0];
            
            if (lastMsg) {
                setSeekers(prevSeekers => prevSeekers.map(s => 
                    s.id === seeker.id ? {
                        ...s,
                        lastMessage: lastMsg.content,
                        lastMessageTime: lastMsg.timestamp ? formatDistanceToNowStrict(lastMsg.timestamp.toDate()) : 'now',
                    } : s
                ));
            }
        });
    });

    return () => unsubscribes.forEach(unsub => unsub());

}, [seekers, user]);


  // Fetch messages for the selected seeker
  useEffect(() => {
    console.log('Messages fetch effect triggered', { 
        hasSelectedSeeker: !!selectedSeeker, 
        hasUser: !!user 
    });
    if (!selectedSeeker || !user) {
        console.log('Skipping messages fetch', { 
            hasSelectedSeeker: !!selectedSeeker, 
            hasUser: !!user 
        });
        return;
    }

    setLoadingMessages(true);
    console.log('Starting to fetch messages for seeker:', selectedSeeker.name);
    const db = getFirestore(app);
    const messagesCollection = collection(db, 'messages');
    
    const q = query(
        messagesCollection,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs
            .map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    content: data.content,
                    senderId: data.from,
                    timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now',
                    self: data.from === user.uid,
                    participants: data.participants,
                } as Message;
            })
            .filter(msg => msg.participants.includes(selectedSeeker.id));
        setMessages(newMessages);
        setLoadingMessages(false);
    });
    
    return () => unsubscribe();
  }, [selectedSeeker, user]);

  const handleSelectSeeker = (seeker: ChatUser) => {
    setSelectedSeeker(seeker);
  }

  const handleSendMessage = async () => {
    if(!newMessage.trim() || !selectedSeeker || !user) return;
    setIsSending(true);
    try {
        const db = getFirestore(app);
        if (!user?.uid) throw new Error('User not authenticated');
        await addDoc(collection(db, 'messages'), {
            from: user.uid,
            to: selectedSeeker.id,
            content: newMessage,
            timestamp: serverTimestamp(),
            read: false,
            participants: [user.uid, selectedSeeker.id].sort(),
        });
        setNewMessage('');
    } catch(error: any) {
        console.error("Error sending message:", error);
        toast({
            title: "Error Sending Message",
            description: error.message || "Could not send your message. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsSending(false);
    }
  }

  return (
        <div className="h-[calc(100vh-8rem)]">
            <PageHeader title="Mentor Connect" description="Your direct line to your seekers." />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {/* Seeker List */}
            <Card className="glass-card md:col-span-1 lg:col-span-1 p-0 h-full overflow-y-auto">
                <div className="p-4 border-b border-primary/20 sticky top-0 bg-card/50 backdrop-blur-sm">
                    <h3 className="font-headline text-xl">Your Seekers</h3>
                </div>
                <div className="space-y-1 p-2">
                    {loadingSeekers ? (
                        Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))
                    ) : seekers.length === 0 ? (
                         <p className="text-center text-muted-foreground p-4">No seekers found.</p>
                    ) : (
                        seekers.map(seeker => (
                            <button
                                key={seeker.id}
                                onClick={() => handleSelectSeeker(seeker)}
                                className={cn(
                                    "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    selectedSeeker?.id === seeker.id ? "bg-primary/10" : "hover:bg-primary/5"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={seeker.avatar} alt={seeker.name} data-ai-hint={seeker.dataAiHint} />
                                        <AvatarFallback>{seeker.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {seeker.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{seeker.name}</p>
                                    <p className="text-sm text-foreground/70 truncate">{seeker.lastMessage}</p>
                                </div>
                                <div className="text-xs text-foreground/50 text-right shrink-0">
                                    <p>{seeker.lastMessageTime}</p>
                                    {seeker.unread && seeker.unread > 0 && <span className="mt-1 inline-block bg-primary text-primary-foreground rounded-full px-2 py-0.5">{seeker.unread}</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Pane */}
            <Card className="glass-card md:col-span-2 lg:col-span-3 p-0 flex flex-col h-full">
                {selectedSeeker ? (
                    <>
                    <div className="p-4 border-b border-primary/20 flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={selectedSeeker.avatar} alt={selectedSeeker.name} />
                            <AvatarFallback>{selectedSeeker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-headline text-xl">{selectedSeeker.name}</h3>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <AnimatePresence>
                             {loadingMessages ? (
                                <div className="flex items-center justify-center h-full text-foreground/50">
                                    <Loader2 className="animate-spin h-8 w-8" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-foreground/50">
                                    <p>Send a message to start the conversation.</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                        className={cn("flex items-end gap-2", msg.self ? 'justify-end' : 'justify-start')}
                                    >
                                        {!msg.self && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={selectedSeeker.avatar} />
                                                <AvatarFallback>{selectedSeeker.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-xs md:max-w-md p-3 rounded-2xl",
                                            msg.self ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card-foreground/10 rounded-bl-none"
                                        )}>
                                            <p>{msg.content}</p>
                                            <p className={cn("text-xs mt-1", msg.self ? "text-primary-foreground/70" : "text-foreground/50")}>
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-primary/20 flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Smile className="text-foreground/70" /></Button>
                        <Input 
                            placeholder={`Message ${selectedSeeker.name}...`}
                            className="flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isSending}
                         />
                        <Button className="glow-button-accent" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send
                        </Button>
                    </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-foreground/50">
                        {loadingSeekers ? <Loader2 className="animate-spin h-8 w-8" /> : <p>Select a seeker to start messaging</p>}
                    </div>
                )}
            </Card>
            </div>
        </div>
  );
}

// Wrapper component for AuthGuard
export default function MentorConnectPageWrapper() {
  const { user, loading } = useAuth();
  console.log('MentorConnectPageWrapper render', { 
    hasUser: !!user, 
    loading, 
    userRole: user?.role 
  });

  return (
    <AuthGuard requiredRole="MENTOR">
      <MentorConnectPage />
    </AuthGuard>
  );
}
