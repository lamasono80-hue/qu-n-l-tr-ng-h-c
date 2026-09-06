// EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      {Icon && (
        <div className="p-4 mb-4 rounded-full bg-indigo-50 text-indigo-600">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
