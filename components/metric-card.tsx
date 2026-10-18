import { Card, CardContent } from "@/components/ui/card";
import type { LedgerStatus } from "@/lib/landing-content";
import { StatusBadge } from "./status-badge";
import { Amount } from "./amount";

export function MetricCard({
  label,
  labelBn,
  amount,
  hint,
  tone,
}: {
  label: string;
  labelBn: string;
  amount: number;
  hint: string;
  tone: LedgerStatus;
}) {
  return (
    <Card className="rounded-lg border-0 bg-card py-5 shadow-layer-1 ring-1 ring-[#e6dfd5]">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label text-muted-foreground">{label}</p>
            <p className="font-bengali text-sm text-muted-foreground">
              {labelBn}
            </p>
          </div>
          <StatusBadge status={tone} />
        </div>
        <Amount value={amount} className="text-metric text-foreground" />
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
