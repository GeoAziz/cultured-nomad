"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const getRoleClass = (role: string) => {
    switch(role?.toLowerCase()) {
        case 'mentor': return 'bg-primary/20 text-primary border-primary/30';
        case 'techie': return 'bg-accent/20 text-accent border-accent/30';
        case 'seeker': return 'bg-secondary text-secondary-foreground';
        default: return 'bg-muted text-muted-foreground';
    }
}

interface Member {
    id: string;
    name: string;
    avatar: string;
    industry?: string;
    role: string;
    dataAiHint?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('all');
  const [role, setRole] = useState('all');
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
        setLoading(true);
        const db = getFirestore(app);
        const membersCollection = collection(db, 'users');
        const memberSnapshot = await getDocs(membersCollection);
        const memberList = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
        
        const uniqueIndustries = [...new Set(memberList.map(m => m.industry).filter(Boolean) as string[])];
        setIndustries(uniqueIndustries);
        
        setMembers(memberList);
        setFilteredMembers(memberList);
        setLoading(false);
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    let newFilteredMembers = members
        .filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(member => industry === 'all' || member.industry === industry)
        .filter(member => role === 'all' || member.role === role);
    setFilteredMembers(newFilteredMembers);
  }, [searchTerm, industry, role, members]);


  return (
    <div className="space-y-8">
      <PageHeader title="Member Directory" description="Connect with ambitious women from every industry." />

      <motion.div 
        className="flex flex-col md:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="techie">Techie</SelectItem>
              <SelectItem value="seeker">Seeker</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="glass-card text-center overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </CardContent>
                </Card>
            ))
        ) : (
            filteredMembers.map(member => (
            <motion.div key={member.id} variants={itemVariants} whileHover={{ y: -5, scale: 1.05 }}>
                <Card className="glass-card text-center overflow-hidden transition-all duration-300 hover:shadow-primary/20">
                <CardContent className="p-6 flex flex-col items-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-headline text-lg font-bold">{member.name}</h3>
                    <p className="text-sm text-foreground/70 mb-4">{member.industry}</p>
                    <Badge className={cn('font-semibold capitalize', getRoleClass(member.role))}>{member.role}</Badge>
                </CardContent>
                </Card>
            </motion.div>
            ))
        )}
      </motion.div>
    </div>
  );
}
