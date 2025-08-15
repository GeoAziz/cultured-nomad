"use client";

import { motion } from 'framer-motion';
import { Users, CreditCard, ShieldCheck, BarChart3 } from 'lucide-react';
import StatCard from '@/components/admin/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ users: 0, revenue: 0, pending: 0, services: 0 });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore(app);
            const usersSnapshot = await getDocs(collection(db, "users"));
            // In a real app, revenue and other stats would come from dedicated collections/analytics
            setStats({
                users: usersSnapshot.size,
                revenue: 56345, // Placeholder
                pending: 12, // Placeholder
                services: 45, // Placeholder
            });

             const data = [
                { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
                { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
            ];
            setChartData(data);

            setLoading(false);
        }
        fetchData();
    }, [])

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="font-headline text-4xl font-bold text-glow">
        Admin Dashboard
      </motion.h1>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard title="Total Users" value={loading ? '...' : stats.users.toLocaleString()} icon={Users} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Revenue" value={loading ? '...' : `$${stats.revenue.toLocaleString()}`} icon={CreditCard} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Pending Approvals" value={loading ? '...' : stats.pending.toLocaleString()} icon={ShieldCheck} />
        </motion.div>
        <motion.div variants={itemVariants}>
            <StatCard title="Active Services" value={loading ? '...' : stats.services.toLocaleString()} icon={BarChart3} />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
        <Card className="admin-glass-card">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-slate-200">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? <Skeleton className="w-full h-[350px]" /> : (
                 <ResponsiveContainer width="100%" height={350}>
                 <BarChart data={chartData}>
                   <XAxis
                     dataKey="name"
                     stroke="#888888"
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                   />
                   <YAxis
                     stroke="#888888"
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                     tickFormatter={(value) => `$${value}`}
                   />
                    <Tooltip
                       contentStyle={{
                           backgroundColor: 'rgba(5, 10, 20, 0.8)',
                           borderColor: 'hsl(var(--primary))',
                           color: '#fff',
                           backdropFilter: 'blur(4px)',
                       }}
                       cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                    />
                   <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
