import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch, FileText } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({ message = 'Loading records...', rows = 4 }: LoadingStateProps) {
  return (
    <div className="py-10 px-4 text-center">
      <div className="w-10 h-10 border-3 border-teal-200 border-t-[#008C95] rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-xs text-gray-500 font-mono tracking-wide">{message}</p>
      
      <div className="max-w-2xl mx-auto mt-6 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200/60 rounded-md animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FolderSearch
}: EmptyStateProps) {
  return (
    <div className="py-14 px-6 text-center border-2 border-dashed border-[#E5E0D5] rounded-2xl bg-white/50 max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008C95] flex items-center justify-center mx-auto mb-3 border border-teal-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#172033] mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#008C95] hover:bg-[#006D75] rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = 'Unable to load information from municipal database.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="p-6 rounded-xl border border-red-200 bg-red-50/70 text-center max-w-lg mx-auto my-6">
      <AlertCircle className="w-8 h-8 text-[#C0392B] mx-auto mb-2" />
      <h4 className="text-sm font-bold text-red-950 mb-1">Communications Error</h4>
      <p className="text-xs text-red-800 leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-900 bg-red-100 hover:bg-red-200 rounded-md transition-colors cursor-pointer border border-red-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
