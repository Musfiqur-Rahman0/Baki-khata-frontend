import { MetricCard } from "@/components/metric-card";
import { Section } from "@/components/section";
import { metrics } from "@/lib/landing-content";

export function MetricsSection() {
  return (
    <Section className="pt-0 md:pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </Section>
  );
}
