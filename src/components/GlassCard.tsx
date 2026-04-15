import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-lg p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
