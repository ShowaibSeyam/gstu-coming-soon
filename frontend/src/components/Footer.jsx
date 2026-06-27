"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail, Phone, MapPin, Globe,
  BookOpen, Landmark, Heart, Library, Briefcase,
  Share2, Rss, Send, Play,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Academic Materials", id: "academic", icon: <BookOpen size={13} /> },
  { label: "Admin Information",  id: "admin",    icon: <Landmark size={13} /> },
  { label: "Support Services",   id: "support",  icon: <Heart size={13} /> },
  { label: "Library Access",     id: "library",  icon: <Library size={13} /> },
  { label: "Alumni & Career",    id: "alumni",   icon: <Briefcase size={13} /> },
];

const SOCIAL = [
  { icon: <Globe size={16} />,  href: "#", label: "Website" },
  { icon: <Share2 size={16} />, href: "#", label: "Share" },
  { icon: <Rss size={16} />,    href: "#", label: "RSS" },
  { icon: <Send size={16} />,   href: "#", label: "Contact" },
];


export default function Footer({ onSectionSelect }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-col footer-brand-col">
          <div className="footer-brand">
            <Image src="/gstu-logo.png" alt="GSTU" width={44} height={44} className="footer-logo" />
            <div>
              <p className="footer-brand-name">GSTU Hub</p>
              <p className="footer-brand-sub">Gopalganj Science &amp; Technology University</p>
            </div>
          </div>
          <p className="footer-about">
            A centralized digital campus hub empowering students with academic resources,
            administrative services, library access and career opportunities — all in one place.
          </p>
          <div className="footer-social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="social-btn" target="_blank" rel="noreferrer">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links column */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Access</h4>
          <ul className="footer-links">
            {QUICK_LINKS.map((l) => (
              <li key={l.id}>
                <button
                  className="footer-link-btn"
                  onClick={() => onSectionSelect?.(l.id)}
                >
                  {l.icon}
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={14} className="footer-contact-icon" />
              <span>Gopalganj Sadar, Gopalganj-8100, Bangladesh</span>
            </li>
            <li>
              <Phone size={14} className="footer-contact-icon" />
              <span>+880-2-XXXXXXXX</span>
            </li>
            <li>
              <Mail size={14} className="footer-contact-icon" />
              <a href="mailto:info@gstu.edu.gov.bd" className="footer-contact-link">info@gstu.edu.gov.bd</a>
            </li>
            <li>
              <Globe size={14} className="footer-contact-icon" />
              <a href="https://www.gstu.edu.gov.bd" target="_blank" rel="noreferrer" className="footer-contact-link">
                www.gstu.edu.gov.bd
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Gopalganj Science and Technology University. All rights reserved.</p>
        <p className="footer-bottom-right">
          Built with ❤️ for GSTU students
        </p>
      </div>
    </footer>
  );
}
