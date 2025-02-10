import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
    </div>
  );
}
