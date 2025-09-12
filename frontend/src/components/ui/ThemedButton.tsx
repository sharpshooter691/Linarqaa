import React from 'react';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--mode-primary)',
          color: 'white',
          border: 'none',
          focusRingColor: 'var(--mode-primary)',
          hoverOpacity: 0.9,
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--mode-secondary)',
          color: 'white',
          border: 'none',
          focusRingColor: 'var(--mode-secondary)',
          hoverOpacity: 0.9,
        };
      case 'outline':
        return {
          backgroundColor: 'var(--mode-surface)',
          color: 'var(--mode-text)',
          borderColor: 'var(--mode-border)',
          border: '1px solid',
          focusRingColor: 'var(--mode-primary)',
          hoverBackgroundColor: 'var(--mode-background)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--mode-text)',
          border: 'none',
          focusRingColor: 'var(--mode-primary)',
          hoverBackgroundColor: 'var(--mode-background)',
        };
      case 'destructive':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          focusRingColor: '#ef4444',
          hoverOpacity: 0.9,
        };
      default:
        return {
          backgroundColor: 'var(--mode-primary)',
          color: 'white',
          border: 'none',
          focusRingColor: 'var(--mode-primary)',
          hoverOpacity: 0.9,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], className)}
      style={{
        ...variantStyles,
        boxShadow: variant === 'primary' || variant === 'secondary' ? `0 2px 4px var(--mode-shadow)30` : 'none',
      }}
      onMouseEnter={(e) => {
        if (variantStyles.hoverOpacity) {
          e.currentTarget.style.opacity = variantStyles.hoverOpacity.toString();
        } else if (variantStyles.hoverBackgroundColor) {
          e.currentTarget.style.backgroundColor = variantStyles.hoverBackgroundColor;
        }
      }}
      onMouseLeave={(e) => {
        if (variantStyles.hoverOpacity) {
          e.currentTarget.style.opacity = '1';
        } else if (variantStyles.hoverBackgroundColor) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemedButton; 