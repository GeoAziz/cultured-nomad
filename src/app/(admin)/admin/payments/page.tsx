"use client";

import { motion } from 'framer-motion';
import { Banknote, Download, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import StatCard from '@/components/admin/stat-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const revenueData = [
  { name: 'Jan', total: 4200 }, { name: 'Feb', total: 3800 }, { name: 'Mar', total: 5100 },
  { name: 'Apr', total: 4900 }, { name: 'May', total: 6200 }, { name: 'Jun', total: 7300 },
];

const transactionData = [
  { id: 'TRN001', user: 'Zoe', amount: 150.00, status: 'Completed', date: '2024-07-28' },
  { id: 'TRN002', user: 'Aisha', amount: 75.50, status: 'Completed', date: '2024-07-27' },
  { id: 'TRN003', user: 'Priya', amount: 200.00, status: 'Pending', date: '2024-07-27' },
  { id: 'TRN004', user: 'Mei', amount: 99.99, status: 'Refunded', date: '2024-07-26' },
  { id: 'TRN005', user: 'Fatima', amount: 50.00, status: 'Completed', date: '2024-07-25' },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-500/20 text-green-400';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'Refunded': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-muted';
  }
};


export default function PaymentsPage() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Payments & Revenue" description="Monitor financial activity and manage transactions." />

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Revenue" value="$82,450.75" icon={TrendingUp} />
          <StatCard title="This Month" value="$7,300.00" icon={TrendingUp} />
          <StatCard title="Pending Payouts" value="$5,120.50" icon={Banknote} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
             <Card className="admin-glass-card">
                <CardHeader>
                    <CardTitle className="font-headline text-xl text-slate-200">Revenue Flow (6 Months)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.8)', borderColor: 'hsl(var(--primary))', color: '#fff' }}
                            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="admin-glass-card">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Quick Actions</CardTitle>
                    <CardDescription>System-level payment functions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full glow-button">
                        <Download className="mr-2 h-4 w-4" />
                        Export Revenue Report
                    </Button>
                     <Button className="w-full glow-button-accent">
                        Process Pending Payouts
                    </Button>
                </CardContent>
            </Card>
        </div>
       </div>

       <Card className="admin-glass-card">
         <CardHeader>
           <CardTitle className="font-headline text-xl text-slate-200">Recent Transactions</CardTitle>
         </CardHeader>
         <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-900/50">
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.map((item) => (
                  <TableRow key={item.id} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.user}</TableCell>
                    <TableCell>${item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-semibold border-none', getStatusClass(item.status))}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         </CardContent>
       </Card>

    </motion.div>
  );
}
