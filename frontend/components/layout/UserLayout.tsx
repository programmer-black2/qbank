import type { ReactNode } from "react";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-blue-50/40 px-4 py-8 text-right md:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-7">{children}</div>
    </div>
  );
}
