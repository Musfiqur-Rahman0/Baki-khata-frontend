import { Icon } from "./store-icon";

export function StoreTrustBar() {
  return (
    <>
      {/* Trust bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-4">
        <div className="w-full bg-background rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-1 text-secondary">
              <Icon name="verified" className="text-[20px]" />
              <span className="font-semibold text-label-lg font-bold text-foreground">
                ডিজিটাল খাতা গ্যারান্টি: ১০০% নিরাপদ ও এনক্রিপ্টেড ব্যাকআপ
              </span>
            </div>
            <div className="h-4 w-px bg-surface-hover hidden md:block" />
            {/* <div className="flex items-center gap-1 text-foreground-muted font-semibold">
                  <Icon
                    name="cloud_sync"
                    className="text-[18px] text-primary"
                  />
                  <span>
                    অফলাইনে ডাটা এন্ট্রি হলেও নেট কানেকশন পাওয়া মাত্রই সার্ভারে
                    জমা হবে
                  </span>
                </div> */}
          </div>
          <div className="flex items-center gap-1 text-label-md text-foreground-muted">
            <span>যেকোনো সমস্যায় কল করুন:</span>
            <span className="font-bold text-primary">০১৭০০-০০০০০০</span>
          </div>
        </div>
      </div>
    </>
  );
}

