import type React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props here if needed
}

const Input: React.FC<InputProps> = ({ className, type = 'text', ...props }) => {
  const baseStyles = "border border-gray-300 rounded py-2 px-3 text-text-main-light dark:text-text-main-dark bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200";
  
  const combinedClassName = `${baseStyles} ${className || ''}`.trim();

  return (
    <input
      type={type}
      className={combinedClassName}
      {...props}
    />
  );
};

export default Input;
