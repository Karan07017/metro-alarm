import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-gps text-white shadow-glow hover:brightness-110 disabled:opacity-40 disabled:shadow-none',
  time: 'bg-gradient-time text-white shadow-glow-time hover:brightness-110 disabled:opacity-40 disabled:shadow-none',
  secondary:
    'bg-surface-2 text-text border border-border hover:border-border-hover disabled:opacity-40',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-white/5 disabled:opacity-40',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 disabled:opacity-40',
};

const sizes = {
  sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-3 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-xl gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-colors transition-shadow duration-200 select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </motion.button>
  );
}
