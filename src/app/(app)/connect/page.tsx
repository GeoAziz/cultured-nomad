
"use client";

import { useState, useEffect, useRef }from 'react';
import { useRouter } from 'next/navigation';
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



export default function ConnectPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    // Role-based routing
    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'mentor':
                    router.push('/connect/mentor');
                    return;
                case 'seeker':
                    router.push('/connect/seeker');
                    return;
            }
        }
    }, [user, router]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [loggedInUserData, setLoggedInUserData] = useState<any>(null);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    // Fetch logged-in user's data
    useEffect(() => {
        if (!user) return;
        const db = getFirestore(app);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('uid', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLoggedInUserData(snapshot.docs[0].data());
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch users to create a chat list, filter by role
    useEffect(() => {
        if(!user) return;
        const db = getFirestore(app);
        const usersCollection = collection(db, 'users');
        let roleFilter: string[] = [];
        // Example: Only show mentors if user is a seeker, or vice versa
        if (user.role === 'seeker') {
            roleFilter = ['mentor'];
        } else if (user.role === 'mentor') {
            roleFilter = ['seeker'];
        } // Add more role logic as needed

        let q;
        if (roleFilter.length > 0) {
            q = query(usersCollection, where('uid', '!=', user.uid), where('role', 'in', roleFilter));
        } else {
            q = query(usersCollection, where('uid', '!=', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({
                id: doc.data().uid,
                name: doc.data().name,
                avatar: doc.data().avatar,
                role: doc.data().role,
                dataAiHint: doc.data().dataAiHint || '',
                lastMessage: 'Click to start a conversation',
                lastMessageTime: '',
                online: true,
            } as ChatUser));
            setChats(chatList);
            setLoadingChats(false);
            if(!selectedChat && chatList.length > 0) {
                setSelectedChat(chatList[0]);
            }
        });
        return () => unsubscribe();
    }, [user]);

   // Fetch last message for each chat
   useEffect(() => {
    if (!user || chats.length === 0) return;
    const db = getFirestore(app);

    const unsubscribes = chats.map(chat => {
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
                .filter(data => data.participants.includes(chat.id))
                .sort((a, b) => b.timestamp?.toMillis?.() - a.timestamp?.toMillis?.())[0];
            if (lastMsg) {
                setChats(prevChats => prevChats.map(c => 
                    c.id === chat.id ? {
                        ...c,
                        lastMessage: lastMsg.content,
                        lastMessageTime: lastMsg.timestamp ? formatDistanceToNowStrict(lastMsg.timestamp.toDate()) : 'now',
                    } : c
                ));
            }
        });
    });

    return () => unsubscribes.forEach(unsub => unsub());

}, [chats.length, user]); // Re-run when number of chats changes

  // Fetch messages for the selected chat
  useEffect(() => {
    if (!selectedChat || !user) return;

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
            .filter(msg => msg.participants.includes(selectedChat.id));

        setMessages(newMessages);
        setLoadingMessages(false);
    });
    
    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleSelectChat = (chat: ChatUser) => {
    setSelectedChat(chat);
  }

  const handleSendMessage = async () => {
    if(!newMessage.trim() || !selectedChat || !user) return;
    setIsSending(true);
    try {
        const db = getFirestore(app);
        if (!user?.uid) throw new Error('User not authenticated');
        await addDoc(collection(db, 'messages'), {
            from: user.uid,
            to: selectedChat.id,
            content: newMessage,
            timestamp: serverTimestamp(),
            read: false,
            participants: [user.uid, selectedChat.id].sort(),
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
                <PageHeader title="Connect" description="Your direct line to the sisterhood." />

                {/* Logged-in user profile */}
                {loggedInUserData && (
                    <Card className="glass-card mb-4 flex items-center gap-4 p-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={loggedInUserData.avatar} alt={loggedInUserData.name} />
                            <AvatarFallback>{loggedInUserData.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-headline text-lg">{loggedInUserData.name}</h2>
                            <p className="text-sm text-muted-foreground">Role: {loggedInUserData.role}</p>
                            {loggedInUserData.bio && <p className="text-xs mt-1">{loggedInUserData.bio}</p>}
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {/* Chat List */}
            <Card className="glass-card md:col-span-1 lg:col-span-1 p-0 h-full overflow-y-auto">
                <div className="p-4 border-b border-primary/20 sticky top-0 bg-card/50 backdrop-blur-sm">
                    <h3 className="font-headline text-xl">Messages</h3>
                </div>
                <div className="space-y-1 p-2">
                    {loadingChats ? (
                        Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))
                    ) : (
                        chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    selectedChat?.id === chat.id ? "bg-primary/10" : "hover:bg-primary/5"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.dataAiHint} />
                                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {chat.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{chat.name}</p>
                                    <p className="text-sm text-foreground/70 truncate">{chat.lastMessage}</p>
                                </div>
                                <div className="text-xs text-foreground/50 text-right shrink-0">
                                    <p>{chat.lastMessageTime}</p>
                                    {chat.unread && chat.unread > 0 && <span className="mt-1 inline-block bg-primary text-primary-foreground rounded-full px-2 py-0.5">{chat.unread}</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Pane */}
            <Card className="glass-card md:col-span-2 lg:col-span-3 p-0 flex flex-col h-full">
                {selectedChat ? (
                    <>
                    <div className="p-4 border-b border-primary/20 flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                            <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-headline text-xl">{selectedChat.name}</h3>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <AnimatePresence>
                             {loadingMessages ? (
                                <div className="flex items-center justify-center h-full text-foreground/50">
                                    <Loader2 className="animate-spin h-8 w-8" />
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
                                                <AvatarImage src={selectedChat.avatar} />
                                                <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
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
                            placeholder="Send a message..." 
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
                        {loadingChats ? <Loader2 className="animate-spin h-8 w-8" /> : <p>Select a chat to start messaging</p>}
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
}
