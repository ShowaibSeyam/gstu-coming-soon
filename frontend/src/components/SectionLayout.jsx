"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Shared wrapper for all section pages.
 * Props:
 *   title      – page heading
 *   description – subtitle text
 *   icon       – JSX icon element
 *   iconBg     – CSS color string for icon background
 *   iconColor  – CSS color string for icon itself
 *   headerClass – extra CSS class on the header (e.g. "theme-academic-header")
 *   children   – section content
 */
export default function SectionLayout({ title, description, icon, iconBg, iconColor, headerClass = "", children }) {
  const router = useRouter();

  return (
    <div className="section-page">
      <div className={`section-header ${headerClass}`}>
        <div className="section-header-inner">
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="section-title-wrap">
            <div className="section-icon-wrap" style={{ background: iconBg, color: iconColor }}>
              {icon}
            </div>
            <div>
              <h1 className="section-title">{title}</h1>
              <p className="section-desc">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-body">
        {children}
      </div>
    </div>
  );
}
