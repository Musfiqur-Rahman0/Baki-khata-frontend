import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/container";

type SectionProps = ComponentProps<"section"> & {
  contained?: boolean;
  tone?: "canvas" | "parchment" | "forest";
};

export function Section({
  className,
  contained = true,
  tone = "canvas",
  children,
  ...props
}: SectionProps) {
  const content = contained ? <Container>{children}</Container> : children;

  return (
    <section
      className={cn(
        "py-16 md:py-24",
        tone === "parchment" && "bg-muted",
        tone === "forest" && "bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    >
      {content}
    </section>
  );
}
