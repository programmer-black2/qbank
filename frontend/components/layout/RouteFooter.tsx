"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/footer/SiteFooter";

const panelRoutes = ["/admin", "/author"];

export default function RouteFooter() {
  const pathname = usePathname();
  const isPanelRoute = panelRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPanelRoute) {
    return null;
  }

  return <SiteFooter />;
}
