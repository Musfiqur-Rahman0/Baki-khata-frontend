import { cn } from "@/lib/utils";
import { formatTaka } from "@/lib/money";

export function Amount({
  value,
  className,
  signed,
}: {
  value: number;
  className?: string;
  signed?: "credit" | "cash";
}) {
  const prefix = signed === "credit" ? "−" : signed === "cash" ? "+" : "";

  return (
    <span
      className={cn(
        "font-heading tabular-nums tracking-tight",
        signed === "credit" && "text-primary",
        signed === "cash" && "text-secondary",
        className
      )}
    >
      {prefix}
      {formatTaka(value)}
    </span>
  );
}
