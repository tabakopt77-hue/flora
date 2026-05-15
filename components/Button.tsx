
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'outlineWhite' | 'white' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <button 
      className={`
        inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'primary' ? 'bg-emerald-900/90 backdrop-blur-md border border-emerald-700/50 text-white hover:bg-emerald-800/95 shadow-[0_4px_15px_rgba(2,43,30,0.2)] hover:shadow-[0_6px_20px_rgba(2,43,30,0.3)] hover:-translate-y-0.5' : ''}
        ${variant === 'secondary' ? 'bg-rose-200 text-rose-900 hover:bg-rose-300' : ''}
        ${variant === 'outline' ? 'border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50' : ''}
        ${variant === 'ghost' ? 'text-emerald-800 hover:bg-emerald-50/50' : ''}
        ${variant === 'outlineWhite' ? 'border-2 border-white/30 text-white hover:bg-white hover:text-emerald-900 backdrop-blur-sm' : ''}
        ${variant === 'white' ? 'bg-white text-emerald-950 hover:bg-emerald-50 shadow-md hover:shadow-xl hover:-translate-y-0.5' : ''}
        ${variant === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5' : ''}
        ${size === 'sm' ? 'px-4 py-1.5 text-sm' : ''}
        ${size === 'md' ? 'px-6 py-2.5 text-base' : ''}
        ${size === 'lg' ? 'px-8 py-3.5 text-lg' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
};
