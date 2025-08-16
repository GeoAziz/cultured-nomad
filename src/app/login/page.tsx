
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AuthLayout from '@/components/auth/auth-layout';
import AuthInput from '@/components/auth/auth-input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', { email });
    setLoading(true);
    setError(null);
    try {
      await login(email, password, {
        onSuccess: (role) => {
          console.log('Login successful. User role:', role);
          if (role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        },
        onError: (err: any) => {
          console.error('Login error details:', { 
            error: err,
            message: typeof err === 'object' && err !== null ? err.message : err,
            code: typeof err === 'object' && err !== null ? err.code : undefined,
            stack: typeof err === 'object' && err !== null ? err.stack : undefined
          });
          setError(typeof err === 'string' ? err : err?.message || 'Login failed');
        },
      });
    } catch (err: any) {
      console.error('Login exception details:', {
        error: err,
        message: err?.message,
        code: err?.code,
        stack: err?.stack
      });
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      console.log('Login attempt finished');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Nomad"
      description="Your journey continues. The sisterhood awaits."
    >
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      <form className="space-y-6" onSubmit={handleLogin}>
        <AuthInput
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          disabled={loading}
          required
        />
        <AuthInput
          id="password"
          type="password"
          placeholder="Your secret passphrase"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={KeyRound}
          disabled={loading}
          required
        />
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" passHref>
            <Button variant="link" className="text-sm p-0 h-auto">Forgot Password?</Button>
          </Link>
        </div>
        <Button type="submit" className="w-full glow-button-accent text-lg py-6" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Not a member yet?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Join the sisterhood
        </Link>
      </p>
    </AuthLayout>
  );
}
