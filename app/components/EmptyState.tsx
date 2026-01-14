"use client";

type EmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="material-icons-round mb-4 text-6xl text-gray-300">
        {icon}
      </span>
      <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-200">
        {title}
      </h3>
      {description && (
        <p className="mb-4 text-sm text-gray-400 dark:text-gray-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
