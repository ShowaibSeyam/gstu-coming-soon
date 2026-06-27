"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function Home() {
  const { loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading GSTU Hub…</span>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* ── Hero Banner ── */}
      <section className="hero-section">
        <div className="hero-banner-wrap">
          <Image
            src="/gstu-banner.png"
            alt="Gopalganj Science and Technology University Campus"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
          <div className="hero-banner-overlay" />
          <div className="hero-content">
            <div className="hero-logo-row">
              <Image src="/gstu-logo.png" alt="GSTU Logo" width={90} height={90} className="hero-logo" />
              <div>
                <p className="hero-university-name">Gopalganj Science and Technology University</p>
                <p className="hero-university-sub">গোপালগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</p>
              </div>
            </div>
            <h1 className="hero-title">Your Centralized Campus Hub</h1>
            <p className="hero-subtitle">
              Access academic materials, stay updated with administrative notices, and explore career resources — all in one place.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">5+</span>
                <span className="hero-stat-label">Sections</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">500+</span>
                <span className="hero-stat-label">Resources</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">24/7</span>
                <span className="hero-stat-label">Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
