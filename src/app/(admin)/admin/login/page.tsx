
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound } from 'lucide-react';
import Starfield from '@/components/landing/starfield';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Firebase Admin Auth
    console.log('Logging in with:', email, password);
    // On successful login, redirect
    router.push('/admin/dashboard');
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-black">
      <Starfield />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-md p-8 space-y-8 admin-glass-card"
      >
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold text-glow">Admin Authentication</h1>
          <p className="text-slate-400 mt-2">Secure access required.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              id="email"
              type="email"
              placeholder="operator@zizo.net"
              className="pl-10 bg-slate-900/50 border-slate-700 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-slate-900/50 border-slate-700 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full glow-button text-lg py-6">
            Authorize
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
