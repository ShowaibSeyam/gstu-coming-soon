"use client";

import {
  BookOpen, GraduationCap, FileText, Briefcase,
  Landmark, Info, Bell, Heart, Library,
  BookMarked, Globe, Search, HelpCircle, User,
  ChevronRight,
} from "lucide-react";

export const MODULES = [
  {
    id: "academic",
    title: "Academic Materials",
    theme: "theme-academic",
    icon: <BookOpen size={24} />,
    description: "Notes, PYQs, e-books and course content",
    links: [
      { label: "Syllabus & Notes",  icon: <FileText size={16} />,   section: "academic" },
      { label: "PYQ Papers",        icon: <FileText size={16} />,   section: "academic" },
      { label: "E-books & Papers",  icon: <BookOpen size={16} />,   section: "academic" },
    ],
  },
  {
    id: "admin",
    title: "Admin Information",
    theme: "theme-admin",
    icon: <Landmark size={24} />,
    description: "Registration, fees, calendar & notices",
    links: [
      { label: "Course Register",  icon: <Info size={16} />,  section: "admin" },
      { label: "Fees & Calendar",  icon: <Info size={16} />,  section: "admin" },
      { label: "Notice & Alerts",  icon: <Bell size={16} />,  section: "admin" },
    ],
  },
  {
    id: "support",
    title: "Support Services",
    theme: "theme-support",
    icon: <Heart size={24} />,
    description: "IT help, scholarships & mental wellness",
    links: [
      { label: "IT Help Desk",   icon: <HelpCircle size={16} />,    section: "support" },
      { label: "Scholarships",   icon: <GraduationCap size={16} />, section: "support" },
      { label: "Mental Health",  icon: <Heart size={16} />,         section: "support" },
    ],
  },
  {
    id: "library",
    title: "Library Access",
    theme: "theme-library",
    icon: <Library size={24} />,
    description: "Digital resources, books & journals",
    links: [
      { label: "Digital Library", icon: <Globe size={16} />,      section: "library" },
      { label: "Book Search",     icon: <Search size={16} />,     section: "library" },
      { label: "Journal Access",  icon: <BookMarked size={16} />, section: "library" },
    ],
  },
  {
    id: "alumni",
    title: "Alumni & Career",
    theme: "theme-alumni",
    icon: <Briefcase size={24} />,
    description: "Network, job listings & career growth",
    links: [
      { label: "Alumni Network",     icon: <User size={16} />,         section: "alumni" },
      { label: "Jobs & Internships", icon: <Briefcase size={16} />,    section: "alumni" },
      { label: "Career Resources",   icon: <GraduationCap size={16} />,section: "alumni" },
    ],
  },
];

function ModuleCard({ mod, activeSection, onSelect }) {
  const isActive = activeSection === mod.id;

  return (
    <div
      className={`module-card ${mod.theme} ${isActive ? "module-card-active" : ""}`}
      onClick={() => onSelect(isActive ? null : mod.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(isActive ? null : mod.id)}
    >
      <div className="card-header">
        <div className="icon-wrapper">{mod.icon}</div>
        <div style={{ flex: 1 }}>
          <h3 className="card-title">{mod.title}</h3>
          <p className="card-desc">{mod.description}</p>
        </div>
        <ChevronRight
          size={16}
          className={`card-chevron ${isActive ? "card-chevron-active" : ""}`}
        />
      </div>

      <ul className="sub-links-list">
        {mod.links.map((link, i) => (
          <li key={i}>
            <button
              className="sub-link-item"
              onClick={(e) => { e.stopPropagation(); onSelect(mod.id); }}
            >
              <span className="icon-small">{link.icon}</span>
              <span>{link.label}</span>
              <ChevronRight size={14} className="icon-small" style={{ marginLeft: "auto" }} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardGrid({ searchQuery, activeSection, onSelect, userRole }) {
  const filtered = MODULES.filter((mod) => {
    // Role-based filtering
    if (userRole === "admin") {
      if (!["admin", "support"].includes(mod.id)) return false;
    } else {
      if (mod.id === "admin") return false;
    }

    const q = searchQuery?.toLowerCase() || "";
    if (!q) return true;
    return (
      mod.title.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.links.some((l) => l.label.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {searchQuery && filtered.length === 0 && (
        <div className="no-results">
          <Search size={40} color="#475569" />
          <p>No results for &quot;<strong>{searchQuery}</strong>&quot;</p>
        </div>
      )}
      <div className="dashboard-grid">
        {filtered.map((mod, idx) => (
          <ModuleCard
            key={idx}
            mod={mod}
            activeSection={activeSection}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}
