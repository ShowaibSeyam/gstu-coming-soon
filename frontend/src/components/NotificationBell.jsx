"use client";

import { useRef, useEffect } from "react";
import { Bell, X, ExternalLink } from "lucide-react";

const CATEGORY_COLORS = {
  Academic: "#3b82f6",
  Admin:    "#d97706",
  Support:  "#10b981",
  Library:  "#ef4444",
};

export default function NotificationBell({ notifs, onToggle, onMarkAllRead, onMarkOne, open }) {
  const bellRef = useRef(null);
  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        onToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onToggle]);

  return (
    <div className="bell-wrap" ref={bellRef}>
      <button
        id="bell-btn"
        className="bell-btn"
        onClick={() => onToggle(!open)}
        aria-label="Notifications"
      >
        <Bell size={20} color="#cbd5e1" />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={onMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifs.length === 0 && (
              <div className="notif-empty">No notifications</div>
            )}
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.read ? "notif-unread" : ""}`}
                onClick={() => onMarkOne(n.id, n.href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onMarkOne(n.id, n.href)}
                title={n.href ? `Go to ${n.category || "page"}` : ""}
              >
                <div className="notif-dot" style={{ opacity: n.read ? 0 : 1 }} />
                <div className="notif-content">
                  {n.category && (
                    <span
                      className="notif-category"
                      style={{ color: CATEGORY_COLORS[n.category] || "#94a3b8" }}
                    >
                      {n.category}
                    </span>
                  )}
                  <div className="notif-text">{n.text}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
                {n.href && (
                  <ExternalLink size={13} className="notif-link-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
