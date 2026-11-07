import { Icon } from "./store-icon";

export function StorePageFooter({ toast }: { toast: string | null }) {
  return (
    <>
      {/* ============================ FOOTER ============================ */}
      <footer className="w-full bg-background py-3 mt-auto shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-1 text-secondary">
              <Icon name="verified_user" className="text-[18px]" />
              <span className="font-semibold text-label-md font-semibold text-foreground">
                ব্যাংক-গ্রেড ২৫৬-বিট এনক্রিপ্টেড ডাটা সুরক্ষা
              </span>
            </div>
            <div className="h-4 w-px bg-surface-hover hidden md:block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-foreground-muted">
              <Icon name="support_agent" className="text-[16px] text-primary" />
              <span className="font-semibold text-label-md font-semibold text-foreground">
                সহায়তা: ১৬২৬০ / ০১৭০০-০০০০০০
              </span>
            </div>
            <span className="font-semibold text-label-md text-foreground-muted">
              © ২০২৫ বাকি খাতা লিমিটেড
            </span>
          </div>
        </div>
      </footer>

      {/* ============================= TOAST ============================ */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-[90vw] bg-secondary text-on-secondary px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-semibold text-sm border border-secondary/60"
        >
          <Icon name="check_circle" className="text-[20px] text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
