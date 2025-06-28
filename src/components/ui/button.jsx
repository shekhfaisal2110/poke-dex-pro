export function Button({ children, onClick, variant = 'default', size = 'md', className = '', ...props }) {
  const base = 'rounded px-4 py-2 font-semibold focus:outline-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-300 text-black hover:bg-gray-400',
    outline: 'border border-gray-400 text-gray-800',
  };
  const sizes = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base',
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
