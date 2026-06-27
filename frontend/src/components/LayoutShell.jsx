"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * LayoutShell wraps every page with the shared Navbar + Footer.
 * It owns the search state so the navbar search works across pages.
 */
export default function LayoutShell({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="layout-wrapper">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="page-content">
        {children}
      </div>
      <Footer />
    </div>
  );
}
