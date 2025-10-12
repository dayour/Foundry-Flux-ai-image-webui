import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variant === "outline"
          ? "border border-zinc-700 text-zinc-400"
          : "bg-purple-500/20 text-purple-300",
        className
      )}
    >
      {children}
    </span>
  );
}
