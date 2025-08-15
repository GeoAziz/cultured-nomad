import { motion } from 'framer-motion';

type PageHeaderProps = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-headline text-4xl font-bold tracking-tight text-glow sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-lg text-foreground/70">
          {description}
        </p>
      )}
    </motion.div>
  );
}
