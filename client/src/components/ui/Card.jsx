import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  as: Component = motion.div,
  ...props
}) {
  return (
    <Component
      className={`glass rounded-2xl shadow-glass ${
        hover ? 'transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5' : ''
      } ${glow ? 'shadow-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
