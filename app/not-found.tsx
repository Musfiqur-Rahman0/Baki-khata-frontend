import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center bg-background px-4 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
          <BookOpen aria-hidden="true" className="size-8" />
        </div>
        <p className="font-mono text-sm font-bold tracking-[0.25em] text-primary">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          এই পাতাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-muted">
          ঠিকানাটি ভুল হতে পারে, অথবা পৃষ্ঠাটি সরিয়ে ফেলা হয়েছে। হোম পেজে
          ফিরে আবার চেষ্টা করুন।
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          হোম পেজে ফিরুন
        </Link>
      </section>
    </main>
  );
}
