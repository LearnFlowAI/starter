import type React from 'react';

interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  value: number; // 0-100
}

const Progress: React.FC<ProgressProps> = ({ value, className, ...props }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <progress
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      max={100}
      value={clampedValue}
      className={`w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 accent-primary ${className || ''}`}
      {...props}
    />
  );
};

export default Progress;
