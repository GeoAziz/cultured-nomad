
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, KeyRound, Loader2, ShieldCheck, ShieldAlert, BookText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/auth-layout';
import AuthInput from '@/components/auth/auth-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    
    await signup(email, password, name, bio, interests.split(',').map(i => i.trim()), {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
    });
  };

  return (
    <AuthLayout
      title="Join the Sisterhood"
      description="Create your account to begin your journey with Cultured Nomads."
    >
        <div className="space-y-4">
            {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Registration Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}
            <form className="space-y-4" onSubmit={handleSignup}>
                <AuthInput
                id="name"
                type="text"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                disabled={loading}
                required
                />
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
                <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <BookText className="absolute left-3 top-3 h-5 w-5 text-slate-500 peer-focus:text-primary transition-colors" />
                    <Textarea 
                        id="bio"
                        placeholder="Tell us a bit about yourself..."
                        className="pl-10 bg-slate-900/50 border-slate-700 transition-shadow duration-300 ease-in-out focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.5)] peer"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={loading}
                    />
                </motion.div>
                <AuthInput
                id="interests"
                type="text"
                placeholder="Interests (e.g. AI, Fintech, Art)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                icon={Heart}
                disabled={loading}
                />
                <AuthInput
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={KeyRound}
                disabled={loading}
                required
                />
                <AuthInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={ShieldCheck}
                disabled={loading}
                required
                />
                <Button type="submit" className="w-full glow-button-accent text-lg py-6" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign In
                </Link>
            </p>
        </div>
    </AuthLayout>
  );
}
