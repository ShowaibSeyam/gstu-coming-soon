"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard } from "lucide-react";
import {
  Search, User, LogOut, X, Menu, ChevronDown,
  BookOpen, Landmark, Heart, Library, Briefcase,
  FileText, Info, Bell, Globe, Search as SearchIcon,
  HelpCircle, GraduationCap, BookMarked, Megaphone,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import Image from "next/image";

const INITIAL_NOTIFS = [
  { id: 1, text: "Mid-term Examination Schedule Released", time: "2h ago", read: false, href: "/academic", category: "Academic" },
  { id: 2, text: "Registration for Elective Courses is now open", time: "5h ago", read: false, href: "/admin", category: "Admin" },
  { id: 3, text: "Campus Network Maintenance – May 3 (12AM–4AM)", time: "1d ago", read: true, href: "/support", category: "Support" },
  { id: 4, text: "Library Extended Hours During Exam Season", time: "2d ago", read: true, href: "/library", category: "Library" },
  { id: 5, text: "Merit Scholarship applications open until May 30", time: "3d ago", read: true, href: "/support", category: "Support" },
];

const NAV_SECTIONS = [
  {
    id: "academic",
    label: "Academic",
    href: "/academic",
    color: "#3b82f6",
    icon: <BookOpen size={15} />,
    links: [
      { label: "Syllabus & Notes", icon: <FileText size={14} />,   href: "/academic" },
      { label: "PYQ Papers",       icon: <FileText size={14} />,   href: "/academic" },
      { label: "E-books & Papers", icon: <BookOpen size={14} />,   href: "/academic" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin",
    color: "#d97706",
    icon: <Landmark size={15} />,
    links: [
      { label: "Course Register", icon: <Info size={14} />,  href: "/admin" },
      { label: "Fees & Calendar", icon: <Info size={14} />,  href: "/admin" },
      { label: "Notice & Alerts", icon: <Bell size={14} />,  href: "/admin" },
    ],
  },
  {
    id: "support",
    label: "Support",
    href: "/support",
    color: "#10b981",
    icon: <Heart size={15} />,
    links: [
      { label: "IT Help Desk",  icon: <HelpCircle size={14} />,    href: "/support" },
      { label: "Scholarships",  icon: <GraduationCap size={14} />, href: "/support" },
      { label: "Mental Health", icon: <Heart size={14} />,         href: "/support" },
    ],
  },
  {
    id: "library",
    label: "Library",
    href: "/library",
    color: "#ef4444",
    icon: <Library size={15} />,
    links: [
      { label: "Digital Library", icon: <Globe size={14} />,      href: "/library" },
      { label: "Book Search",     icon: <SearchIcon size={14} />, href: "/library" },
      { label: "Journal Access",  icon: <BookMarked size={14} />, href: "/library" },
    ],
  },
  {
    id: "alumni",
    label: "Alumni",
    href: "/alumni",
    color: "#8b5cf6",
    icon: <Briefcase size={15} />,
    links: [
      { label: "Alumni Network",     icon: <User size={14} />,         href: "/alumni" },
      { label: "Jobs & Internships", icon: <Briefcase size={14} />,    href: "/alumni" },
      { label: "Career Resources",   icon: <GraduationCap size={14} />,href: "/alumni" },
    ],
  },
];

function getInitials(name) {
  if (!name) return "S";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function NavDropdown({ section, currentPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timeoutRef = useRef(null);
  const isActive = currentPath?.startsWith(section.href);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="nav-dropdown-wrap"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={section.href}
        className={`nav-section-btn ${isActive ? "nav-section-active" : ""}`}
        style={{ "--accent": section.color, textDecoration: "none" }}
      >
        <span className="nav-section-icon">{section.icon}</span>
        {section.label}
        <ChevronDown size={13} className={`nav-chevron ${open ? "nav-chevron-open" : ""}`} />
      </Link>

      {open && (
        <div className="nav-dropdown" style={{ "--accent": section.color }}>
          <Link
            href={section.href}
            className="nav-dropdown-header"
            onClick={() => setOpen(false)}
          >
            <span className="nav-dropdown-icon" style={{ color: section.color }}>
              {section.icon}
            </span>
            <span>All {section.label}</span>
          </Link>
          <div className="nav-dropdown-divider" />
          {section.links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="nav-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <span className="nav-dropdown-item-icon" style={{ color: section.color }}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Global Search Bar ──────────────────────────────────────────────
const SEARCH_INDEX = NAV_SECTIONS.flatMap((section) => [
  {
    label: section.label,
    description: `All ${section.label}`,
    href: section.href,
    color: section.color,
    icon: section.icon,
  },
  ...section.links.map((link) => ({
    label: link.label,
    description: section.label,
    href: link.href,
    color: section.color,
    icon: link.icon,
  })),
]);

function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  const results = query.trim().length > 0
    ? SEARCH_INDEX.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (href) => {
    setQuery("");
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0].href);
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="search-bar-wrap" ref={ref}>
      <div className="search-bar">
        <Search size={16} color="#94a3b8" />
        <input
          id="global-search"
          type="text"
          placeholder="Search sections..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="search-results-dropdown">
          {results.map((item, i) => (
            <button
              key={i}
              className="search-result-item"
              onClick={() => handleSelect(item.href)}
            >
              <span className="search-result-icon" style={{ color: item.color }}>
                {item.icon}
              </span>
              <div className="search-result-text">
                <span className="search-result-label">{item.label}</span>
                <span className="search-result-desc">{item.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="search-results-dropdown">
          <div className="search-no-result">No results for "{query}"</div>
        </div>
      )}
    </div>
  );
}


export default function Navbar({ searchQuery, onSearchChange }) {
  const { user, logout, getDashboardPath, isSuperAdmin, isTeacher } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [mobileOpen, setMobileOpen] = useState(false);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id, href) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (href) router.push(href);
    setBellOpen(false);
  };

  // Unread notifs for marquee
  const unreadNotifs = notifs.filter((n) => !n.read);

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
          <Image src="/gstu-logo.png" alt="GSTU Logo" width={38} height={38} className="nav-logo-img" />
          <div className="nav-brand-text">
            <span className="nav-brand-name">GSTU Hub</span>
            <span className="nav-brand-sub">Gopalganj Sci &amp; Tech University</span>
          </div>
        </Link>

        {/* Desktop Section Nav */}
        <div className="nav-sections">
          {NAV_SECTIONS.map((section) => (
            <NavDropdown
              key={section.id}
              section={section}
              currentPath={pathname}
            />
          ))}
        </div>

        {/* Search */}
        <SearchBar />

        {/* Right actions */}
        <div className="nav-actions">
          <NotificationBell
            notifs={notifs}
            open={bellOpen}
            onToggle={setBellOpen}
            onMarkAllRead={markAllRead}
            onMarkOne={markOne}
          />

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc", fontSize: "0.875rem" }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="avatar-initials">{getInitials(user.displayName || user.name || user.email)}</div>
                )}
                <span className="hide-on-mobile">{(user.displayName || user.name)?.split(" ")[0] || "User"}</span>
              </div>

              {/* Role badge */}
              <span className={`nav-role-badge nav-role-${isSuperAdmin ? "super" : isTeacher ? "teacher" : "student"}`}>
                {isSuperAdmin ? "Super Admin" : isTeacher ? "Teacher" : "Student"}
              </span>

              {/* Dashboard link */}
              <Link
                href={getDashboardPath?.() || "/"}
                id="dashboard-link"
                className="btn-login btn-dashboard"
              >
                <LayoutDashboard size={15} />
                <span className="hide-on-mobile">Dashboard</span>
              </Link>

              <button
                id="logout-btn"
                className="btn-login"
                onClick={logout}
                style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef4444" }}
              >
                <LogOut size={15} /> <span className="hide-on-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <button id="login-btn" className="btn-login" onClick={() => router.push("/login")}>
              <User size={15} /> Login
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="mobile-nav-menu">
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="mobile-nav-section">
                <Link
                  href={section.href}
                  className="mobile-nav-section-title"
                  style={{ color: section.color }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{section.icon}</span> {section.label}
                </Link>
                <div className="mobile-nav-links">
                  {section.links.map((link, i) => (
                    <Link
                      key={i}
                      href={link.href}
                      className="mobile-nav-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.icon} {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Notification Marquee Banner */}
      {unreadNotifs.length > 0 && (
        <div className="notif-marquee-bar" aria-live="polite">
          <div className="notif-marquee-icon">
            <Megaphone size={13} />
            <span>LIVE</span>
          </div>
          <div className="notif-marquee-track">
            <div className="notif-marquee-inner">
              {[...unreadNotifs, ...unreadNotifs].map((n, i) => (
                <Link
                  key={i}
                  href={n.href || "/"}
                  className="notif-marquee-item"
                  onClick={() => markOne(n.id, null)}
                >
                  <span className="notif-marquee-dot" />
                  {n.text}
                  <span className="notif-marquee-sep">·</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
