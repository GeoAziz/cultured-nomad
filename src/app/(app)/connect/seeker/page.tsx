"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Send, 
    Smile, 
    Loader2, 
    VideoIcon, 
    PhoneIcon, 
    Star, 
    Calendar,
    Clock,
    BookOpen,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    collection, 
    getDocs, 
    getFirestore, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    Timestamp, 
    addDoc, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';

import { useWebRTC } from '@/hooks/use-webrtc';
import { CallModal } from '@/components/calls/call-modal';

interface MentorUser {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
    specialty?: string;
    rating?: number;
    experience?: string;
    availability?: string;
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

function SeekerConnectPage() {
    const { user } = useAuth();
    const [mentors, setMentors] = useState<MentorUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMentor, setSelectedMentor] = useState<MentorUser | null>(null);
    const [loadingMentors, setLoadingMentors] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState<string | null>(null);
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

    // Scroll to bottom on new message/call event
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, callHistory]);

    // Fetch mentors from Firestore
    useEffect(() => {
        if (!user || user.role.toUpperCase() !== 'SEEKER') return;
        setLoadingMentors(true);
        const db = getFirestore(app);
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('role', 'in', ['MENTOR', 'mentor']));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mentorList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.uid,
                    name: data.name,
                    avatar: data.avatar,
                    specialty: data.specialty || 'General Mentoring',
                    rating: data.rating || 4.5,
                    experience: data.experience || '5+ years',
                    availability: data.availability || 'Available',
                    lastMessage: 'Start a conversation...',
                    lastMessageTime: '',
                    online: true,
                };
            });
            setMentors(mentorList);
            setLoadingMentors(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch last message for each mentor
    useEffect(() => {
        if (!user || mentors.length === 0) return;
        const db = getFirestore(app);
        mentors.forEach(mentor => {
            const messagesCollection = collection(db, 'messages');
            const q = query(
                messagesCollection,
                where('participants', 'array-contains', user.uid),
                orderBy('timestamp', 'desc'),
                limit(1)
            );
            onSnapshot(q, (snapshot) => {
                const lastMsg = snapshot.docs
                    .map(doc => doc.data())
                    .filter(data => data.participants.includes(mentor.id))
                    .sort((a, b) => b.timestamp?.toMillis?.() - a.timestamp?.toMillis?.())[0];
                if (lastMsg) {
                    setMentors(prevMentors => prevMentors.map(m =>
                        m.id === mentor.id ? {
                            ...m,
                            lastMessage: lastMsg.content,
                            lastMessageTime: lastMsg.timestamp ? formatDistanceToNowStrict(lastMsg.timestamp.toDate()) : 'now',
                        } : m
                    ));
                }
            });
        });
    }, [mentors, user]);

    // Fetch messages for selected mentor
    useEffect(() => {
        if (!selectedMentor || !user) {
            setMessages([]);
            setLoadingMessages(false);
            return;
        }
        setLoadingMessages(true);
        const db = getFirestore(app);
        const messagesCollection = collection(db, 'messages');
        const q = query(
            messagesCollection,
            where('participants', 'array-contains', user.uid),
            orderBy('timestamp', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs
                .map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        content: data.content,
                        senderId: data.from,
                        timestamp: data.timestamp ? (data.timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now',
                        self: data.from === user.uid,
                        participants: data.participants,
                    };
                })
                .filter(msg => msg.participants.includes(selectedMentor.id));
            setMessages(newMessages);
            setLoadingMessages(false);
        });
        return () => unsubscribe();
    }, [selectedMentor, user]);

    const handleSelectMentor = (mentor: MentorUser) => {
        setSelectedMentor(mentor);
    };

    const handleSendMessage = async () => {
        if(!newMessage.trim() || !selectedMentor || !user) return;
        setIsSending(true);
        try {
            const db = getFirestore(app);
            await addDoc(collection(db, 'messages'), {
                from: user.uid,
                to: selectedMentor.id,
                content: newMessage,
                timestamp: serverTimestamp(),
                read: false,
                participants: [user.uid, selectedMentor.id].sort(),
            });
            setNewMessage('');
        } catch(error: any) {
            toast({
                title: "Error Sending Message",
                description: error.message || "Could not send your message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleStartCall = async (mentorId: string, type: 'audio' | 'video') => {
        try {
            toast({
                title: `Starting ${type} call`,
                description: `Connecting with ${selectedMentor?.name}...`,
                variant: "default"
            });
            await startCall(mentorId, type);
        } catch (error: any) {
            toast({
                title: "Call Failed",
                description: error.message || "Could not start the call. Please try again.",
                variant: "destructive"
            });
        }
    };

    // Merge messages and call events for inline rendering
    const mergedEvents = [
        ...messages.map(m => ({ ...m, eventType: 'message' })),
        ...callHistory
            .filter(call => selectedMentor && (call.peer === selectedMentor.id || !call.peer))
            .map((call, idx) => ({
                id: `call-event-${idx}-${call.time}`,
                eventType: 'call',
                callType: call.type,
                status: call.status,
                time: call.time,
            }))
    ];

    return (
        <div className="h-[calc(100vh-8rem)]">
            <PageHeader 
                title="Connect with Mentors" 
                description="Find and chat with mentors who can guide you on your journey." 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
                {/* Mentor List */}
                {/* ...existing code for mentor list... */}
                <Card className="glass-card md:col-span-1 lg:col-span-1 p-0 h-full flex flex-col">
                    {/* ...existing code for mentor list... */}
                    <div className="p-4 border-b border-primary/20 sticky top-0 bg-card/50 backdrop-blur-sm space-y-4">
                        <h3 className="font-headline text-xl">Available Mentors</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search mentors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-1 p-2">
                            {loadingMentors ? (
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
                            ) : mentors.length === 0 ? (
                                <p className="text-center text-muted-foreground p-4">No mentors available.</p>
                            ) : (
                                mentors.map(mentor => (
                                    <button
                                        key={mentor.id}
                                        onClick={() => handleSelectMentor(mentor)}
                                        className={cn(
                                            "w-full text-left flex items-start gap-4 p-4 rounded-lg transition-all",
                                            selectedMentor?.id === mentor.id ? "bg-primary/10" : "hover:bg-primary/5"
                                        )}
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={mentor.avatar} alt={mentor.name} />
                                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-semibold">{mentor.name}</h4>
                                            <p className="text-sm text-foreground/70">{mentor.specialty}</p>
                                            <div className="flex items-center gap-4 text-xs text-foreground/50">
                                                <span>{mentor.experience}</span>
                                                <span>{mentor.availability}</span>
                                            </div>
                                            {mentor.lastMessage && (
                                                <div className="mt-2 flex items-center justify-between text-sm">
                                                    <p className="text-foreground/70 truncate">{mentor.lastMessage}</p>
                                                    <span className="text-xs text-foreground/50">{mentor.lastMessageTime}</span>
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
                    {selectedMentor ? (
                        <>
                            <div className="p-4 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-card/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={selectedMentor.avatar} alt={selectedMentor.name} />
                                        <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-headline text-xl">{selectedMentor.name}</h3>
                                        <p className="text-sm text-foreground/70">{selectedMentor.specialty}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                                        onClick={() => handleStartCall(selectedMentor.id, 'audio')}
                                    >
                                        <PhoneIcon className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                                        onClick={() => handleStartCall(selectedMentor.id, 'video')}
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
                                    ) : mergedEvents.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                            <div className="p-4 rounded-full bg-primary/10">
                                                <Star className="h-8 w-8 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">Start Your Mentorship Journey</h3>
                                                <p className="text-foreground/70 max-w-sm">
                                                    Send a message to {selectedMentor.name} to begin your learning experience.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        mergedEvents
                                            .sort((a, b) => {
                                                const aTime = a.eventType === 'call' ? new Date((a as any).time).getTime() : new Date(`1970-01-01T${(a as any).timestamp}`).getTime();
                                                const bTime = b.eventType === 'call' ? new Date((b as any).time).getTime() : new Date(`1970-01-01T${(b as any).timestamp}`).getTime();
                                                return aTime - bTime;
                                            })
                                            .map(msg => {
                                                if (msg.eventType === 'call') {
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                            className="flex items-center justify-center"
                                                        >
                                                            <div className={cn(
                                                                "inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-medium border border-blue-200 shadow-sm",
                                                                (msg as any).status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' : (msg as any).status === 'ended' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''
                                                            )}>
                                                                {(msg as any).callType === 'video' ? <VideoIcon className="inline-block mr-2 h-4 w-4" /> : <PhoneIcon className="inline-block mr-2 h-4 w-4" />}
                                                                {(msg as any).status === 'active' ? 'Call started' : (msg as any).status === 'ended' ? 'Call ended' : (msg as any).status === 'failed' ? 'Call failed' : (msg as any).status === 'ringing' ? 'Ringing...' : (msg as any).status}
                                                                <span className="ml-2 text-xs text-foreground/50">{new Date((msg as any).time).toLocaleTimeString()}</span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                } else {
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                            className={cn("flex items-end gap-2", (msg as any).self ? 'justify-end' : 'justify-start')}
                                                        >
                                                            {!(msg as any).self && (
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={selectedMentor.avatar} />
                                                                    <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            <div className={cn(
                                                                "max-w-xs md:max-w-md p-3 rounded-2xl",
                                                                (msg as any).self ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card-foreground/10 rounded-bl-none"
                                                            )}>
                                                                <p>{(msg as any).content}</p>
                                                                <p className={cn("text-xs mt-1", (msg as any).self ? "text-primary-foreground/70" : "text-foreground/50")}>{(msg as any).timestamp}</p>
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
                                <Button variant="ghost" size="icon">
                                    <Smile className="text-foreground/70" />
                                </Button>
                                <Input 
                                    placeholder={`Message ${selectedMentor.name}...`}
                                    className="flex-1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isSending}
                                />
                                <Button 
                                    className="glow-button-accent" 
                                    onClick={handleSendMessage} 
                                    disabled={isSending || !newMessage.trim()}
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
                            <div className="p-4 rounded-full bg-primary/10">
                                <Star className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-xl">Choose a Mentor</h3>
                                <p className="text-foreground/70 max-w-sm">
                                    Select a mentor from the list to start your learning journey.
                                </p>
                            </div>
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
                peerName={selectedMentor?.name}
            />
            {/* Call Status Banner */}
            {isCallActive && (
                <div className="fixed bottom-4 right-4 z-50">
                    {callStatus === 'connecting' && (
                        <div className="bg-blue-700 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
                            Connecting to {selectedMentor?.name}...
                        </div>
                    )}
                    {callStatus === 'ringing' && (
                        <div className="bg-yellow-600 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
                            Ringing {selectedMentor?.name}...
                        </div>
                    )}
                    {callStatus === 'active' && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
                            In call with {selectedMentor?.name}
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
        </div>
    );
}

