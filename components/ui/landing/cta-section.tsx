import { ctaData } from "@/lib/landing-content";
import { Button } from "../button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-20 text-center sm:py-28"
      data-purpose="bottom-cta"
    >
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full border border-stone-200 bg-[#F5EFE6] text-forest-900 shadow-sm">
          <svg
            className="size-6 text-forest-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>

        <h2 className="font-serif-title text-4xl font-bold leading-tight tracking-tight text-forest-950 sm:text-5xl">
          {ctaData.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base font-normal text-stone-600 sm:text-lg">
          {ctaData.description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <Link
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-terracotta-600 px-8 py-3.5 text-base font-semibold text-white shadow-float transition duration-200 hover:bg-terracotta-700 hover:shadow-card-lift focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 bg-[#b84c25]"
          >
            {ctaData.primaryBtn}
          </Link>
          <a
            href="/demo-store"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-stone-300 bg-[#FAF8F5] px-7 py-3.5 text-base font-semibold text-stone-800 shadow-sm transition duration-200 hover:bg-[#F5EFE6]"
          >
            {ctaData.secondaryBtn}
          </a>
        </div>

        <p className="mt-6 text-xs text-stone-500">{ctaData.disclaimer}</p>
      </div>
    </section>
  );
}
