"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/header";

const hiddenLayoutRoutes = ["/admin", "/author", "/login", "/register"];

export default function RouteHeader() {
  const pathname = usePathname();
  const shouldHideHeader = hiddenLayoutRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
