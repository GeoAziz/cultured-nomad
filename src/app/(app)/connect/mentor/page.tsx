
"use client";

import { useState, useEffect, useRef }from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Smile, Loader2, VideoIcon, PhoneIcon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, getFirestore, query, where, onSnapshot, orderBy, Timestamp, addDoc, Unsubscribe, limit, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useWebRTC } from '@/hooks/use-webrtc';
import { CallModal } from '@/components/calls/call-modal';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterInterests, setFilterInterests] = useState<string | null>(null);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // WebRTC integration
    const {
        startCall,
        endCall,
        localStream,
        remoteStream,
        isCallActive,
        callType,
        error: callError,
        callStatus,
        callHistory
    } = useWebRTC(user?.uid || '');

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
        // Use two queries for 'SEEKER' and 'seeker' and merge results
        const seekersArr: ChatUser[] = [];
        const unsubSeeker = onSnapshot(query(usersCollection, where('role', '==', 'SEEKER')), (snapshot) => {
            seekersArr.push(...snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.uid,
                    name: data.name,
                    avatar: data.avatar,
                    dataAiHint: data.dataAiHint || '',
                    lastMessage: 'Start a conversation...',
                    lastMessageTime: '',
                    online: true,
                } as ChatUser;
            }));
            setSeekers([...seekersArr]);
            setLoadingSeekers(false);
        }, (error) => {
            setLoadingSeekers(false);
            toast({
                title: "Error Loading Seekers",
                description: error.message,
                variant: "destructive"
            });
        });
        const unsubSeekerLower = onSnapshot(query(usersCollection, where('role', '==', 'seeker')), (snapshot) => {
            seekersArr.push(...snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.uid,
                    name: data.name,
                    avatar: data.avatar,
                    dataAiHint: data.dataAiHint || '',
                    lastMessage: 'Start a conversation...',
                    lastMessageTime: '',
                    online: true,
                } as ChatUser;
            }));
            setSeekers([...seekersArr]);
            setLoadingSeekers(false);
        }, (error) => {
            setLoadingSeekers(false);
            toast({
                title: "Error Loading Seekers",
                description: error.message,
                variant: "destructive"
            });
        });
        return () => {
            unsubSeeker();
            unsubSeekerLower();
        };
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
        // Create participants array in sorted order
        const participants = [user.uid, seeker.id].sort();
        const q = query(
            messagesCollection,
            where('participants', 'array-contains', user.uid),
            orderBy('timestamp', 'desc'),
            limit(1)
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
    
    // Create participants array in sorted order to ensure consistent querying
    const participants = [user.uid, selectedSeeker.id].sort();
    const q = query(
        messagesCollection,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'asc')
    );    const unsubscribe = onSnapshot(q, (snapshot) => {
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

  // Handle call functionality
  const handleStartCall = async (seekerId: string, type: 'audio' | 'video') => {
    try {
      console.log('Initiating call:', { seekerId, type });
      
      // Show immediate feedback
      toast({
        title: `Starting ${type} call`,
        description: `Connecting with ${selectedSeeker?.name}...`,
        variant: "default"
      });

      await startCall(seekerId, type);
      
      console.log('Call initiated:', { 
        isCallActive,
        hasLocalStream: !!localStream,
        hasRemoteStream: !!remoteStream
      });
    } catch (error: any) {
      console.error('Call failed:', error);
      toast({
        title: "Call Failed",
        description: error.message || "Could not start the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
        <div className="h-[calc(100vh-8rem)]">
            <PageHeader title="Mentor Connect" description="Your direct line to your seekers." />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {/* Seeker List */}
            <Card className="glass-card md:col-span-1 lg:col-span-1 p-0 h-full flex flex-col">
                <div className="p-4 border-b border-primary/20 sticky top-0 bg-card/50 backdrop-blur-sm space-y-4">
                    <h3 className="font-headline text-xl">Your Seekers</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search seekers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-1 p-2">
                        {loadingSeekers ? (
                            Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))
                        ) : seekers.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4">No seekers found.</p>
                        ) : (
                            seekers
                                .filter(seeker => 
                                    searchQuery === '' || 
                                    seeker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    seeker.dataAiHint?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(seeker => (
                                    <button
                                        key={seeker.id}
                                        onClick={() => handleSelectSeeker(seeker)}
                                        className={cn(
                                            "w-full text-left flex items-start gap-4 p-4 rounded-lg transition-all",
                                            selectedSeeker?.id === seeker.id ? "bg-primary/10" : "hover:bg-primary/5"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={seeker.avatar} alt={seeker.name} data-ai-hint={seeker.dataAiHint} />
                                                <AvatarFallback>{seeker.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {seeker.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-semibold">{seeker.name}</h4>
                                            <p className="text-sm text-foreground/70">{seeker.dataAiHint}</p>
                                            {seeker.lastMessage && (
                                                <div className="mt-2 flex items-center justify-between text-sm">
                                                    <p className="text-foreground/70 truncate">{seeker.lastMessage}</p>
                                                    <span className="text-xs text-foreground/50">{seeker.lastMessageTime}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                        )}
                    </div>
                </div>
            </Card>

            {/* Chat Pane */}
            <Card className="glass-card md:col-span-2 lg:col-span-3 p-0 flex flex-col h-full">
                {selectedSeeker ? (
                    <>
                    <div className="p-4 border-b border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={selectedSeeker.avatar} alt={selectedSeeker.name} />
                                <AvatarFallback>{selectedSeeker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-headline text-xl">{selectedSeeker.name}</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                                onClick={() => handleStartCall(selectedSeeker.id, 'audio')}
                            >
                                <PhoneIcon className="h-5 w-5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                                onClick={() => handleStartCall(selectedSeeker.id, 'video')}
                            >
                                <VideoIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <AnimatePresence>
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full text-foreground/50">
                                    <Loader2 className="animate-spin h-8 w-8" />
                                </div>
                            ) : messages.length === 0 && callHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <Star className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Start Mentoring</h3>
                                        <p className="text-foreground/70 max-w-sm">
                                            Send a message to {selectedSeeker.name} to begin your mentoring session.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                [...messages.map(m => ({ ...m, eventType: 'message' })),
                                ...callHistory
                                    .filter(call => selectedSeeker && (call.peer === selectedSeeker.id || !call.peer))
                                    .map((call, idx) => ({
                                        id: `call-event-${idx}-${call.time}`,
                                        eventType: 'call',
                                        callType: call.type,
                                        status: call.status,
                                        time: call.time,
                                    }))]
                                    .sort((a, b) => {
                                        const aTime = a.eventType === 'call' ? new Date((a as any).time).getTime() : new Date(`1970-01-01T${(a as any).timestamp}`).getTime();
                                        const bTime = b.eventType === 'call' ? new Date((b as any).time).getTime() : new Date(`1970-01-01T${(b as any).timestamp}`).getTime();
                                        return aTime - bTime;
                                    })
                                    .map(event => {
                                        if (event.eventType === 'call') {
                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className={cn(
                                                        "inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-medium border border-blue-200 shadow-sm",
                                                        (event as any).status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' : (event as any).status === 'ended' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''
                                                    )}>
                                                        {(event as any).callType === 'video' ? <VideoIcon className="inline-block mr-2 h-4 w-4" /> : <PhoneIcon className="inline-block mr-2 h-4 w-4" />}
                                                        {(event as any).status === 'active' ? 'Call started' : (event as any).status === 'ended' ? 'Call ended' : (event as any).status === 'failed' ? 'Call failed' : (event as any).status === 'ringing' ? 'Ringing...' : (event as any).status}
                                                        <span className="ml-2 text-xs text-foreground/50">{new Date((event as any).time).toLocaleTimeString()}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        } else {
                                            const msg = event as Message & { eventType: 'message' };
                                            return (
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
                                                        <p className={cn("text-xs mt-1", msg.self ? "text-primary-foreground/70" : "text-foreground/50")}>{msg.timestamp}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                    })
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

            {/* Call Modal */}
            <CallModal
                isOpen={isCallActive}
                callType={callType || 'audio'}
                remoteStream={remoteStream}
                localStream={localStream}
                onEndCall={endCall}
                peerName={selectedSeeker?.name}
            />

            {/* Call Status Banner */}
            {isCallActive && (
                <div className="fixed bottom-4 right-4 z-50">
                    {callStatus === 'connecting' && (
                        <div className="bg-blue-700 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
                            Connecting to {selectedSeeker?.name}...
                        </div>
                    )}
                    {callStatus === 'ringing' && (
                        <div className="bg-yellow-600 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
                            Ringing {selectedSeeker?.name}...
                        </div>
                    )}
                    {callStatus === 'active' && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
                            In call with {selectedSeeker?.name}
                        </div>
                    )}
                    {callStatus === 'ended' && (
                        <div className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg">
                            Call ended
                        </div>
                    )}
                    {callStatus === 'failed' && (
                        <div className="bg-red-700 text-white px-4 py-2 rounded-full shadow-lg">
                            Call failed. Please try again.
                        </div>
                    )}
                </div>
            )}

            {/* Call Error Banner */}
            {callError && (
                <div className="fixed bottom-20 right-4 z-50 bg-red-700 text-white px-4 py-2 rounded shadow-lg">
                    Error: {callError}
                </div>
            )}

            {/* Call History Panel */}
            {callHistory.length > 0 && (
                <div className="fixed bottom-4 left-4 z-40 bg-white/90 border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                    <h4 className="font-semibold mb-2">Recent Calls</h4>
                    <ul className="space-y-1 text-sm">
                        {callHistory.slice(-5).reverse().map((call, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                                <span>{call.type} call</span>
                                <span className={call.status === 'active' ? 'text-green-600' : call.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>
                                    {call.status}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(call.time).toLocaleTimeString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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
