
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Starfield from '@/components/landing/starfield';

export default function AdminSplashPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate a loading process

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const redirectTimer = setTimeout(() => {
        router.push('/admin/login');
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [loading, router]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-black text-slate-100">
      <Starfield />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="z-10 text-center"
      >
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-glow">
          Zizo_Admin_Core
        </h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-lg text-primary/80"
        >
          {loading ? 'System Initializing...' : 'Core Systems Online. Redirecting...'}
        </motion.p>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
