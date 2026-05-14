import Link from "next/link";
import type { ReactNode } from "react";

type AdminHeaderVariant = "blue" | "green" | "purple";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  onLogout?: () => void;
  variant?: AdminHeaderVariant;
}

const variantClasses: Record<AdminHeaderVariant, string> = {
  blue: "from-blue-500 to-purple-600 shadow-blue-100",
  green: "from-green-500 to-blue-600 shadow-green-100",
  purple: "from-purple-500 to-blue-600 shadow-purple-100",
};

function AdminHeaderIcon({ variant }: { variant: AdminHeaderVariant }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${variantClasses[variant]} text-white shadow-lg`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    </div>
  );
}

export default function AdminHeader({
  title,
  subtitle,
  userName,
  backHref,
  backLabel = "بازگشت به داشبورد",
  actions,
  onLogout,
  variant = "blue",
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AdminHeaderIcon variant={variant} />

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-0.5 hidden text-sm leading-6 text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {backLabel}
              </Link>
            )}

            {userName && (
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 md:block">
                خوش آمدید،{" "}
                <span className="font-bold text-slate-900">{userName}</span>
              </div>
            )}

            {actions}

            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:border-red-200 hover:bg-red-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                خروج
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
