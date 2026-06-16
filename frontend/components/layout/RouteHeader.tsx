"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/header";

const panelRoutes = ["/admin", "/author"];

export default function RouteHeader() {
  const pathname = usePathname();
  const isPanelRoute = panelRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPanelRoute) {
    return null;
  }

  return <Header />;
}
