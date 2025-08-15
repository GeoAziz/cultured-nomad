
"use client";

import Starfield from '@/components/landing/starfield';
import Logo from '@/components/shared/logo';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring',
      damping: 15,
      stiffness: 100,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Starfield />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-md space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <Link href="/" passHref>
            <Logo className="h-12 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="font-headline text-3xl font-bold text-glow">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </motion.div>

        <motion.div 
            variants={itemVariants} 
            className="glass-card p-8 space-y-6"
        >
            {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
// This needs to import Link for the Logo
import Link from 'next/link';

