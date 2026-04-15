import { cn } from "@/lib/utils";

const badgeVariants = {
  neutral: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-300"
};

export function Badge({
  children,
  className,
  variant = "neutral"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
