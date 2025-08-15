
import { Input } from "@/components/ui/input"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon
}

export default function AuthInput({ icon: Icon, className, ...props }: AuthInputProps) {
    return (
        <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 peer-focus:text-primary transition-colors" />
            <Input
              className={cn(
                "pl-10 bg-slate-900/50 border-slate-700 h-12 text-base transition-shadow duration-300 ease-in-out",
                "focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.5)] peer",
                className
              )}
              {...props}
            />
             <div className="absolute inset-0 rounded-md border border-transparent peer-focus:border-primary/50 pointer-events-none animate-pulse"/>
        </motion.div>
    )
}
