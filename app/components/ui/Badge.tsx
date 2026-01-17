import type React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  // Any specific badge props can go here, e.g., variant for different colors
}

const Badge: React.FC<BadgeProps> = ({ className, children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary transition-colors duration-200";
  
  const combinedClassName = `${baseStyles} ${className || ''}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Badge;
