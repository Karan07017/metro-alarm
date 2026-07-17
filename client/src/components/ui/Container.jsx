export default function Container({ children, className = '', size = 'md' }) {
  const sizes = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
  };
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 ${sizes[size]} ${className}`}>{children}</div>
  );
}
