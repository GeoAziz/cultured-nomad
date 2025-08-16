
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import Starfield from '@/components/landing/starfield';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AuthInput from '@/components/auth/auth-input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    await login(email, password, {
      onSuccess: (role) => {
        toast({ title: 'Authorization successful.' });
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // This case should ideally not be hit due to login logic, but as a fallback:
          setError("You do not have administrative privileges.");
          setLoading(false);
        }
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      }
    });
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-black">
      <Starfield />
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 w-full max-w-md p-8 space-y-8 admin-glass-card"
      >
        <div className="text-center">
            <div className="inline-block bg-red-500/20 text-red-300 rounded-full p-2 mb-4 border border-red-500/50">
                <ShieldAlert className="h-8 w-8 text-glow" />
            </div>
          <h1 className="font-headline text-4xl font-bold text-glow">Admin Authentication</h1>
          <p className="text-slate-400 mt-2">Secure terminal access required.</p>
        </div>

        {error && (
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4"/>
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <AuthInput
            id="email"
            type="email"
            placeholder="operator@culturednomads.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            disabled={loading}
            required
          />
           <AuthInput
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={KeyRound}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full glow-button text-lg py-6" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Authorize'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
