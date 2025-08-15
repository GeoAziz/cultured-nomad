"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import Starfield from '@/components/landing/starfield';
import Typewriter from '@/components/landing/typewriter';
import Logo from '@/components/shared/logo';

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-background text-foreground">
      <Starfield />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.5,
            },
          },
        }}
        className="z-10 flex flex-col items-center justify-center text-center p-4"
      >
        <motion.div
          variants={{
            hidden: { scale: 0.5, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
              },
            },
          }}
          className="mb-8"
        >
          <Logo className="h-24 w-auto" />
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.8, ease: 'easeOut' },
            },
          }}
          className="font-headline text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter"
        >
          <Typewriter text="A Sisterhood of Ambitious Women. Join. Grow. Glow." />
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.8, ease: 'easeOut', delay: 2.5 },
            },
          }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/dashboard" passHref>
            <Button className="glow-button px-8 py-6 text-lg w-48" size="lg">
              Enter Hub
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button className="outline-glass-button px-8 py-6 text-lg w-48" size="lg">
              Join Now
            </Button>
          </Link>
        </motion.div>
      </motion.main>

      <motion.div
        className="absolute bottom-8 z-10"
        animate={{
          y: [0, 10, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
          },
        }}
      >
        <ChevronDown className="h-8 w-8 text-primary/70 text-glow" />
      </motion.div>
    </div>
  );
}
