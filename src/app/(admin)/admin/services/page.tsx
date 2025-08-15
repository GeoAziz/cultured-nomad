"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const serviceListings = [
  { id: 'SRV001', title: 'AI-Powered Logo Design', creator: 'Aisha Khan', status: 'Pending', category: 'Design', price: 250 },
  { id: 'SRV002', title: 'Web3 Smart Contract Audit', creator: 'Zoe Hart', status: 'Approved', category: 'Web3', price: 1500 },
  { id: 'SRV003', title: 'Personalized Career Coaching', creator: 'Priya Sharma', status: 'Approved', category: 'Mentorship', price: 100 },
  { id: 'SRV004', title: 'VR Experience Prototyping', creator: 'Mei Lin', status: 'Pending', category: 'XR', price: 800 },
  { id: 'SRV005', title: 'Fintech API Integration', creator: 'Fatima Al-Jamil', status: 'Rejected', category: 'Fintech', price: 1200 },
  { id: 'SRV006', title: 'Ghostwriting: Sci-Fi Novel', creator: 'Aisha Khan', status: 'Approved', category: 'Writing', price: 3000 },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-green-500/20 text-green-400';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'Rejected': return 'bg-red-500/20 text-red-400';
    default: return 'bg-muted';
  }
};


export default function ServicesPage() {

  const renderTable = (status: string) => {
    const filteredServices = serviceListings.filter(s => status === 'All' || s.status === status);
    return (
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-900/50">
              <TableHead>Service Title</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id} className="border-slate-800 hover:bg-slate-900/50">
                <TableCell className="font-medium">{service.title}</TableCell>
                <TableCell>{service.creator}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>${service.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={cn('font-semibold border-none', getStatusClass(service.status))}>
                    {service.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-800">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                        <Check className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" size="icon" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                        <X className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Service Listings" description="Review, approve, and manage all services on the platform." />

       <Card className="admin-glass-card">
         <CardHeader>
           <CardTitle className="font-headline text-xl text-slate-200">Management Console</CardTitle>
         </CardHeader>
         <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">{renderTable('Pending')}</TabsContent>
              <TabsContent value="approved" className="mt-4">{renderTable('Approved')}</TabsContent>
              <TabsContent value="rejected" className="mt-4">{renderTable('Rejected')}</TabsContent>
              <TabsContent value="all" className="mt-4">{renderTable('All')}</TabsContent>
            </Tabs>
         </CardContent>
       </Card>

    </motion.div>
  );
}
