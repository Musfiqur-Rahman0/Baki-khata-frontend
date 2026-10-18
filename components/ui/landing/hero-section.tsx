import { heroData } from "@/lib/landing-content";
import Image from "next/image";

export function HeroSection() {
  return (
    <section
      className="ledger-grid-bg relative overflow-hidden border-b border-stone-200/60 pb-16 pt-16 md:pb-24 md:pt-20"
      data-purpose="hero-section"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Live Status Pill Tag */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-stone-300 bg-stone-100 px-3.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm sm:text-sm">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{heroData.statusPill}</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif-title mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-forest-950 sm:text-6xl md:text-7xl">
          {heroData.headline}
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-stone-600 sm:mt-8 sm:text-lg md:text-xl">
          {heroData.subheading}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <a
            href={heroData.primaryCta.href}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#143628] px-8 py-3.5 text-base font-semibold text-white shadow-float transition duration-200 hover:bg-forest-800 hover:shadow-card-lift focus:outline-none focus:ring-2 focus:ring-forest-900 focus:ring-offset-2"
          >
            {heroData.primaryCta.label}
            <svg
              className="-mr-1 ml-2 size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </a>
          <a
            href={heroData.secondaryCta.href}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-7 py-3.5 text-base font-semibold text-stone-800 shadow-sm transition duration-200 hover:bg-stone-50"
          >
            {heroData.secondaryCta.label}
          </a>
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-stone-200/80 pt-6 text-xs font-medium text-stone-500 sm:text-sm">
          {heroData.trustPoints.map((point) => (
            <span key={point} className="flex items-center gap-1.5">
              <svg
                className="size-4 shrink-0 text-forest-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
              {point}
            </span>
          ))}
        </div>
      </div>

      {/* Authentic Shopkeeper Hero Image Container */}
      <div className="mx-auto mt-12 max-w-5xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden rounded-2xl border border-stone-300 bg-stone-900 shadow-card-lift sm:rounded-3xl">
          <Image
            alt="বাংলাদেশের ঐতিহ্যবাহী মুদি দোকানের বাস্তব চিত্র — রহিম স্টোর"
            className="h-72 w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] sm:h-96 md:h-[440px]"
            src={heroData.heroCard.imageUrl}
            width={700}
            height={500}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#143628]/90 via-[#143628]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-between gap-4 p-5 text-white sm:flex-row sm:items-end sm:p-7 md:p-9">
            <div className="max-w-xl">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-forest-900/80 px-3 py-1 text-xs font-medium text-amber-200 backdrop-blur-sm">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>{heroData.heroCard.shopBadge}</span>
              </div>
              <h3 className=" text-xl font-bold leading-snug !text-white sm:text-2xl">
                {heroData.heroCard.title}
              </h3>
              <p className="mt-1.5 text-xs font-normal leading-relaxed text-stone-200 sm:text-sm">
                {heroData.heroCard.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-stone-600/50 bg-stone-900/70 px-3.5 py-2 text-xs text-stone-200 backdrop-blur-md">
              <svg
                className="size-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>{heroData.heroCard.guaranteeBadge}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
