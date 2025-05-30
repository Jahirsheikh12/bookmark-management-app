import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "skeleton";
  text?: string;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  text,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex items-center space-x-2">
          <Loader2 className={cn("animate-spin", sizeClasses[size])} />
          {text && (
            <span className="text-sm text-muted-foreground">{text}</span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div
              className={cn(
                "rounded-full bg-current animate-pulse",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
            />
            <div
              className={cn(
                "rounded-full bg-current animate-pulse",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className={cn(
                "rounded-full bg-current animate-pulse",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          {text && (
            <span className="text-sm text-muted-foreground">{text}</span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      </div>
    );
  }

  return null;
}

// Page loading component
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
        <div className="flex space-x-2 pt-2">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// List item loading skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-3">
      <div className="h-8 w-8 bg-muted rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
