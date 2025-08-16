
"use client";

import { useState, useEffect } from 'react';
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
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';

interface Service {
    id: string;
    title: string;
    creator: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    category: string;
    price: number;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-green-500/20 text-green-400';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'Rejected': return 'bg-red-500/20 text-red-400';
    default: return 'bg-muted';
  }
};


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const servicesCollection = collection(db, 'services');
      let q;
      if (activeTab === 'all') {
        q = query(servicesCollection);
      } else {
        const status = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
        q = query(servicesCollection, where('status', '==', status));
      }
      
      try {
        const serviceSnapshot = await getDocs(q);
        const serviceList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(serviceList);
      } catch (error) {
        console.error(`Error fetching ${activeTab} services:`, error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [activeTab]);


  const renderTableContent = () => {
    if (loading) {
      return (
          Array.from({length: 3}).map((_, i) => (
              <TableRow key={i} className="border-slate-800">
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right space-x-2">
                      <Skeleton className="h-8 w-8 inline-block rounded" />
                      <Skeleton className="h-8 w-8 inline-block rounded" />
                      <Skeleton className="h-8 w-8 inline-block rounded" />
                  </TableCell>
              </TableRow>
          ))
      )
    }

    if (services.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center">
            No services found for this category.
          </TableCell>
        </TableRow>
      )
    }

    return (
        services.map((service) => (
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
        ))
    )
  }

  const renderTable = () => {
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
            {renderTableContent()}
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
            <Tabs defaultValue="pending" className="w-full" onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">{renderTable()}</TabsContent>
              <TabsContent value="approved" className="mt-4">{renderTable()}</TabsContent>
              <TabsContent value="rejected" className="mt-4">{renderTable()}</TabsContent>
              <TabsContent value="all" className="mt-4">{renderTable()}</TabsContent>
            </Tabs>
         </CardContent>
       </Card>

    </motion.div>
  );
}
