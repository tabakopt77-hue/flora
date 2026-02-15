import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'outlineWhite';
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
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900 shadow-md hover:shadow-lg",
    secondary: "bg-rose-200 text-rose-900 hover:bg-rose-300",
    outline: "border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50",
    ghost: "text-emerald-800 hover:bg-emerald-50/50",
    outlineWhite: "border-2 border-white/30 text-white hover:bg-white hover:text-emerald-900 backdrop-blur-sm"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};