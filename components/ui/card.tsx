import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 bg-card/90 p-6 shadow-soft backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
