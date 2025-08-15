"use client";

import { useState } from 'react';
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


const usersData = [
  { id: 'u001', name: 'Aisha Khan', email: 'aisha@nexusai.com', role: 'Mentor', status: 'Active', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman portrait' },
  { id: 'u002', name: 'Zoe Hart', email: 'zoe.hart@web3.dev', role: 'Techie', status: 'Active', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman professional' },
  { id: 'u003', name: 'Priya Sharma', email: 'priya.s@fintech.co', role: 'Seeker', status: 'Active', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'indian woman' },
  { id: 'u004', name: 'Mei Lin', email: 'mei.lin@creative.io', role: 'Techie', status: 'Banned', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'asian woman' },
  { id: 'u005', name: 'Fatima Al-Jamil', email: 'fatima.j@corp.net', role: 'Mentor', status: 'Active', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman smile' },
];

const getRoleClass = (role: string) => {
    switch(role?.toLowerCase()) {
        case 'mentor': return 'bg-primary/20 text-primary';
        case 'techie': return 'bg-accent/20 text-accent';
        case 'admin': return 'bg-red-500/20 text-red-400';
        default: return 'bg-slate-500/20 text-slate-400';
    }
}
const getStatusClass = (status: string) => {
    return status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
}


export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = usersData.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                <Select defaultValue="all-roles">
                    <SelectTrigger className="w-[160px] bg-slate-900/50 border-slate-700">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-roles">All Roles</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="techie">Techie</SelectItem>
                        <SelectItem value="seeker">Seeker</SelectItem>
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
                {filteredUsers.map((user) => (
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
                         <Badge className={cn('font-semibold border-none', getRoleClass(user.role))}>
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
                ))}
              </TableBody>
            </Table>
         </CardContent>
       </Card>

    </motion.div>
  );
}
