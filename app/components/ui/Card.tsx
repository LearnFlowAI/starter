import type React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add any custom props here if needed
}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  // Using rounded-xl as it aligns more with ui-ux-reference's larger radii (e.g., in NavBar)
  const baseStyles = "bg-card-light dark:bg-card-dark rounded-xl shadow-card p-4 transition-colors duration-200";
  
  const combinedClassName = `${baseStyles} ${className || ''}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;
