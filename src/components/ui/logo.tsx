import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  tag?: string;
  subtitle?: string;
  priority?: boolean;
}

const sizeClasses = {
  xs: 'h-7 w-7 rounded-lg p-0.5',
  sm: 'h-8 w-8 sm:h-9 sm:w-9 rounded-xl p-1',
  md: 'h-10 w-10 sm:h-11 sm:w-11 rounded-xl p-1',
  lg: 'h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-1.5',
  xl: 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl p-2',
};

const imageDimensions = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Logo({
  size = 'md',
  className,
  imageClassName,
  showText = false,
  tag,
  subtitle,
  priority = false,
}: LogoProps) {
  const dim = imageDimensions[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none overflow-hidden', className)}>
      <div
        className={cn(
          'shrink-0 bg-white border border-orange-200/80 shadow-sm shadow-orange-500/10 flex items-center justify-center overflow-hidden transition-transform',
          sizeClasses[size]
        )}
      >
        <Image
          src="/logo.png"
          alt="RestoDesk Logo"
          width={dim}
          height={dim}
          priority={priority}
          className={cn('h-full w-full object-contain', imageClassName)}
        />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-foreground text-base sm:text-lg leading-tight truncate">
              RestoDesk
            </span>
            {tag && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shrink-0">
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
