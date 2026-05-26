import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Loading({ size = 'md', className }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin text-gray-600', sizes[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" />
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
      <Loading size="lg" />
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
