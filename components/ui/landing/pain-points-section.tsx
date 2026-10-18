import { painPointsData } from "@/lib/landing-content";

function getIcon(tone: "amber" | "rose" | "emerald") {
  if (tone === "amber") {
    return (
      <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-amber-100 font-serif text-lg font-bold text-amber-800">
        <svg
          className="size-5 text-amber-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }
  if (tone === "rose") {
    return (
      <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-rose-100 font-serif text-lg font-bold text-rose-800">
        <svg
          className="size-5 text-rose-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-emerald-100 font-serif text-lg font-bold text-emerald-800">
      <svg
        className="size-5 text-emerald-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export function PainPointsSection() {
  return (
    <section
      className="border-b border-stone-200/70 bg-white py-16 sm:py-24"
      data-purpose="pain-points-section"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta-600">
            {painPointsData.eyebrow}
          </p>
          <h2 className="font-serif-title text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {painPointsData.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {painPointsData.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-[#FAF8F5] p-7 shadow-subtle transition-all duration-200 hover:border-stone-300 hover:shadow-float"
            >
              <div>
                {getIcon(item.tone)}
                <h3 className="font-serif-title mb-2.5 text-xl font-bold text-forest-950">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
                <span className="font-bold text-forest-900">সমাধান:</span>{" "}
                {item.solution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
