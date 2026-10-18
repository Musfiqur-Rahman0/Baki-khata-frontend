import { howItWorksData } from "@/lib/landing-content";

export function HowItWorksSection() {
  return (
    <section
      className="border-b border-stone-200/80 bg-[#FAF8F5] py-16 sm:py-24"
      data-purpose="process-steps"
      id="how-it-works"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta-600">
            {howItWorksData.eyebrow}
          </p>
          <h2 className="font-serif-title text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {howItWorksData.title}
          </h2>
          <p className="mt-3 text-sm text-stone-600 sm:text-base">
            {howItWorksData.description}
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {howItWorksData.steps.map((step) => (
            <div
              key={step.step}
              className="relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-7 shadow-subtle"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full border border-terracotta-500/20 bg-terracotta-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-600">
                    {step.stepBadge}
                  </span>
                  <span className="font-serif text-3xl font-bold text-stone-300">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-serif-title mb-3 text-xl font-bold text-forest-950">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  {step.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl border border-stone-200 bg-[#FAF8F5] p-3.5 text-xs font-medium text-stone-600">
                {step.snippet}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
