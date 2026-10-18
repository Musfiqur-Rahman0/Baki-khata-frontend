import { featuresData } from "@/lib/landing-content";

function getFeatureIcon(type: "clock" | "chart" | "zap" | "message") {
  if (type === "clock") {
    return (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (type === "chart") {
    return (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (type === "zap") {
    return (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M13 10V3L4 14h7v7l9-11h-7z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function FeaturesSection() {
  return (
    <section
      className="border-b border-stone-200 bg-[#FAF8F5] py-16 sm:py-24"
      data-purpose="features-grid"
      id="features"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta-600">
            {featuresData.eyebrow}
          </p>
          <h2 className="font-serif-title text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {featuresData.title}
          </h2>
          <p className="mt-2 text-sm text-stone-600 sm:text-base">
            {featuresData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {featuresData.items.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl border border-stone-200 bg-white p-7 shadow-subtle transition-all hover:border-stone-300"
            >
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-forest-900 text-amber-200">
                {getFeatureIcon(feature.iconType)}
              </div>
              <h3 className="font-serif-title mb-2 text-xl font-bold text-forest-950">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
