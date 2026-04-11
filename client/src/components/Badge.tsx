import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
