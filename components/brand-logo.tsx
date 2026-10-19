import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";

export function BrandLogo({ className }: { className?: string }) {
  const user = useAppSelector((state) => state.auth.user);
  const isLoggedIn = Boolean(user);

  return (
    <Link
      href={isLoggedIn ? "/onbording" : "/"}
      aria-label="Baki Khata Home"
      className={cn(
        "group flex items-center gap-3 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-forest-800",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#143628] text-parchment-50 shadow-md shadow-forest-950/15 transition-colors group-hover:bg-forest-800">
        <svg
          className="size-5 text-amber-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-serif-title text-xl font-bold leading-none tracking-tight text-forest-950">
          বাকি খাতা
        </span>
        <span className="mt-0.5 text-[12px] font-medium tracking-wider text-stone-500">
          সহজ ও নির্ভরযোগ্য ডিজিটাল খাতা
        </span>
      </div>
    </Link>
  );
}
