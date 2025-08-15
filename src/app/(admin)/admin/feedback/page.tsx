"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Bug, Lightbulb, MessageSquareWarning, Search } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

const feedbackData = [
  { id: 'FB001', type: 'Bug', subject: 'Profile picture not updating on mobile', user: 'user123', status: 'Open', submitted: '2024-07-28' },
  { id: 'FB002', type: 'Suggestion', subject: 'Add dark mode to the public site', user: 'user456', status: 'Reviewed', submitted: '2024-07-27' },
  { id: 'FB003', type: 'Abuse Report', subject: 'Inappropriate message from user X', user: 'user789', status: 'Open', submitted: '2024-07-27' },
  { id: 'FB004', type: 'Suggestion', subject: 'Gamify the mentorship process', user: 'user101', status: 'Archived', submitted: '2024-07-26' },
  { id: 'FB005', type: 'Bug', subject: 'Login button unresponsive on Firefox', user: 'user212', status: 'In Progress', submitted: '2024-07-25' },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open': return 'bg-red-500/20 text-red-400';
    case 'In Progress': return 'bg-yellow-500/20 text-yellow-400';
    case 'Reviewed': return 'bg-blue-500/20 text-blue-400';
    case 'Archived': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-muted';
  }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Bug': return <Bug className="h-4 w-4" />;
        case 'Suggestion': return <Lightbulb className="h-4 w-4" />;
        case 'Abuse Report': return <MessageSquareWarning className="h-4 w-4" />;
        default: return null;
    }
}

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredFeedback = feedbackData.filter(f => f.subject.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Feedback & Reports" description="Monitor and address user feedback and system reports." />

       <Card className="admin-glass-card">
         <CardHeader>
           <div className="flex justify-between items-center">
             <CardTitle className="font-headline text-xl text-slate-200">Incoming Queue</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  placeholder="Search feedback..."
                  className="w-full max-w-sm pl-10 bg-slate-900/50 border-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
           </div>
         </CardHeader>
         <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-900/50">
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow key={item.id} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="font-medium flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        {item.type}
                    </TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-semibold border-none', getStatusClass(item.status))}>
                        {item.status}
                      </Badge>
                    </TableCell>
                     <TableCell>{item.submitted}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
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
