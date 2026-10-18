import { faqData } from "@/lib/landing-content";

export function FaqSection() {
  return (
    <section
      className="border-b border-stone-200 bg-[#FAF8F5] py-16 sm:py-24"
      data-purpose="faq-section"
      id="faq"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-terracotta-600">
            {faqData.eyebrow}
          </p>
          <h2 className="font-serif-title text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {faqData.title}
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.items.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-subtle transition-all duration-200 hover:border-stone-300"
            >
              <h3 className="font-serif-title mb-2 text-lg font-bold text-forest-950">
                {item.question}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
