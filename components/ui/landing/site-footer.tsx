export function SiteFooter() {
  return (
    <footer
      className="border-t border-stone-200 bg-[#F5EFE6] py-6"
      data-purpose="site-footer"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-stone-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-serif-title text-sm font-bold text-forest-950">
            বাকি খাতা
          </span>
          <span>— সহজ ডিজিটাল খাতা, কোনো পেমেন্ট গেটওয়ে নয়।</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a className="transition hover:text-stone-800" href="#how-it-works">
            কীভাবে কাজ করে
          </a>
          <a className="transition hover:text-stone-800" href="#privacy">
            গোপনীয়তা নীতি
          </a>
          <a className="transition hover:text-stone-800" href="#faq">
            সহায়তা
          </a>
          <span className="text-stone-400">© ২০২৫ বাকি খাতা</span>
        </div>
      </div>
    </footer>
  );
}
