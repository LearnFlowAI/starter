import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'fab';
  icon?: string; // Material Icon name
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className,
  ...props
}) => {
  const baseStyles = "flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  let variantStyles = '';
  let iconSizeClass = '';
  let iconOnlyClass = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90 active:scale-95 shadow-md';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 active:scale-95 shadow-sm';
      break;
    case 'icon':
      variantStyles = 'text-gray-400 hover:text-primary active:scale-90';
      iconOnlyClass = 'w-10 h-10'; // Default size for icon buttons
      iconSizeClass = 'text-2xl'; // Default icon size for icon buttons
      break;
    case 'fab': // Floating Action Button (from NavBar's add button)
      variantStyles = 'w-14 h-14 rounded-full bg-primary text-white shadow-glow hover:scale-105 active:scale-95';
      iconOnlyClass = 'w-14 h-14';
      iconSizeClass = 'text-3xl'; // Specific icon size for FAB
      break;
  }

  const combinedClassName = `${baseStyles} ${variantStyles} ${iconOnlyClass} ${className || ''}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {icon && (
        <span className={`material-icons-round ${iconSizeClass} ${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
