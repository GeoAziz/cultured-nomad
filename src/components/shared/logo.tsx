import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 100" // Adjusted viewBox for better text rendering
    className={cn('text-primary', props.className)}
    {...props}
  >
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <text
      x="50%"
      y="50%"
      dy=".35em"
      textAnchor="middle"
      className="font-headline font-bold"
      fontSize="48" // Using fontSize attribute for better scaling
      fill="currentColor"
      filter="url(#glow)"
    >
      Cultured Nomads
    </text>
  </svg>
);

export default Logo;
