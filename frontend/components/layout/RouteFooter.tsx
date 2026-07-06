"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/footer/SiteFooter";

const hiddenLayoutRoutes = ["/admin", "/author", "/login", "/register"];

export default function RouteFooter() {
  const pathname = usePathname();
  const shouldHideFooter = hiddenLayoutRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <SiteFooter />;
}
