import { cn } from "@/lib/utils";
import type { LedgerStatus } from "@/lib/landing-content";
import { Badge } from "@/components/ui/badge";

const statusCopy: Record<LedgerStatus, { en: string; bn: string }> = {
  overdue: { en: "Due", bn: "বকেয়া" },
  rolling: { en: "Rolling", bn: "চলতি বাকি" },
  settled: { en: "Paid", bn: "পরিশোধিত" },
};

const statusClass: Record<LedgerStatus, string> = {
  overdue: "bg-[var(--status-overdue)] text-[var(--status-overdue-fg)]",
  rolling: "bg-[var(--status-rolling)] text-[var(--status-rolling-fg)]",
  settled: "bg-[var(--status-settled)] text-[var(--status-settled-fg)]",
};

const dotClass: Record<LedgerStatus, string> = {
  overdue: "bg-[var(--status-overdue-fg)]",
  rolling: "bg-[var(--status-rolling-fg)]",
  settled: "bg-[var(--status-settled-fg)]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LedgerStatus;
  className?: string;
}) {
  const copy = statusCopy[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 gap-1.5 rounded-full border-transparent px-2.5 font-semibold",
        statusClass[status],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClass[status])} />
      <span>
        {copy.bn}
        <span className="ml-1 font-medium opacity-70">· {copy.en}</span>
      </span>
    </Badge>
  );
}
