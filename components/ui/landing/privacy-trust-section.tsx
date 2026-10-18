import { privacyData } from "@/lib/landing-content";

export function PrivacyTrustSection() {
  const icons = [
    // Lock / Store
    <svg key="0" className="size-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        fillRule="evenodd"
      />
    </svg>,
    // Shield
    <svg key="1" className="size-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        fillRule="evenodd"
      />
    </svg>,
    // Check approval
    <svg key="2" className="size-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        fillRule="evenodd"
      />
    </svg>,
    // Trash delete
    <svg key="3" className="size-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        fillRule="evenodd"
      />
    </svg>,
  ];

  return (
    <section
      className="border-b border-stone-200/80 bg-white py-16 sm:py-24"
      data-purpose="privacy-trust-guarantee"
      id="privacy"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0e241b] p-8 text-white shadow-card-lift sm:p-12">
          {/* Background decorative radial flourish */}
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-forest-800/40 blur-3xl" />

          <div className="relative z-10">
            <span className="mb-4 inline-block rounded-full border border-forest-800 bg-forest-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
              {privacyData.badge}
            </span>
            <h2 className="font-serif-title max-w-xl text-3xl font-bold tracking-tight !text-white sm:text-4xl">
              {privacyData.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
              {privacyData.description}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {privacyData.points.map((point, index) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1a4331] text-amber-200">
                    {icons[index % icons.length]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold !text-white">
                      {point.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-300">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
