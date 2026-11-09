const variants = {
  primary:
    'bg-[#ff4655] hover:bg-[#ff5866] text-white border border-[#ff4655] shadow-[0_0_15px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.6)]',
  secondary: 'bg-[#1f2937] hover:bg-[#374151] text-[#ece8e1] border border-[#374151]',
  outline:
    'bg-transparent border border-[#ff4655] text-[#ff4655] hover:bg-[#ff4655] hover:text-white',
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const baseStyles =
    'px-6 py-3 font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;