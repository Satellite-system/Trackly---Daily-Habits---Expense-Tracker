import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function Loader({ className, fullScreen = false }: LoaderProps) {
  const loader = (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent',
        className
      )}
    ></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        {loader}
      </div>
    );
  }

  return loader;
}
