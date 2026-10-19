const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  ghost: 'text-slate-600 hover:bg-slate-100',
};
const SIZES = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' };

/** Class string so links (<Link>) can look like buttons too. */
export const buttonStyles = (variant = 'primary', size = 'md') =>
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return <button type={type} className={`${buttonStyles(variant, size)} ${className}`} {...props} />;
}
