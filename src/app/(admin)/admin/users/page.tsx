
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, ShieldOff, MoreVertical } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserRole } from '@/hooks/use-auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string; // This is mock status, can be expanded later
  avatar: string;
  dataAiHint?: string;
}


const getRoleClass = (role: string) => {
    switch(role?.toLowerCase()) {
        case 'mentor': return 'bg-green-500/20 text-green-400';
        case 'seeker': return 'bg-blue-500/20 text-blue-400';
        case 'techie': return 'bg-purple-500/20 text-purple-400';
        case 'admin': return 'bg-red-500/20 text-red-400';
        default: return 'bg-slate-500/20 text-slate-400';
    }
}
const getStatusClass = (status: string) => {
    return status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
}


export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        const db = getFirestore(app);
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data(), status: 'Active'} as User)); // Status is mock
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
    }
    fetchUsers();
  }, [])
  
  useEffect(() => {
    let results = users
      .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(u => roleFilter === 'all' || u.role === roleFilter);
    setFilteredUsers(results);
  }, [searchTerm, roleFilter, users]);


  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="User Management" description="Oversee and manage all Cultured Nomads members." />

       <Card className="admin-glass-card">
         <CardHeader>
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <CardTitle className="font-headline text-xl text-slate-200">Member Directory</CardTitle>
             <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                        placeholder="Search by name..."
                        className="w-full pl-10 bg-slate-900/50 border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[160px] bg-slate-900/50 border-slate-700">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="techie">Techie</SelectItem>
                        <SelectItem value="seeker">Seeker</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="glow-button-accent">
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Add User
                </Button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-900/50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    Array.from({length: 5}).map((_, i) => (
                         <TableRow key={i} className="border-slate-800">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                         </TableRow>
                    ))
                ) : (
                    filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-900/50">
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border-2 border-primary/50">
                                    <AvatarImage src={user.avatar} data-ai-hint={user.dataAiHint} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{user.name}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge className={cn('font-semibold border-none capitalize', getRoleClass(user.role))}>
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge className={cn('font-semibold border-none', getStatusClass(user.status))}>
                                {user.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="admin-glass-card border-slate-700">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
                                <ShieldOff className="mr-2 h-4 w-4" />
                                {user.status === 'Active' ? 'Ban User' : 'Unban User'}
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
         </CardContent>
       </Card>

    </motion.div>
  );
}
