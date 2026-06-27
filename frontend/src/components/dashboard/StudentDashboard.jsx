"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen, GraduationCap, CreditCard, Calendar,
  Bell, Library, Heart, Briefcase, TrendingUp,
  Clock, CheckCircle, AlertCircle,
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function StatCard({ icon, label, value, color }) {
  return (
    <div className="db-stat-card" style={{ "--db-accent": color }}>
      <div className="db-stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div>
        <p className="db-stat-value">{value}</p>
        <p className="db-stat-label">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, href, color }) {
  return (
    <a href={href} className="db-quick-link" style={{ "--db-accent": color }}>
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/student/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="db-loading">
        <div className="loading-spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const { enrolledCourses = [], feeItems = [], events = [], notices = [] } = data || {};
  const pendingFees = feeItems.filter((f) => !f.paid).length;
  const paidFees = feeItems.filter((f) => f.paid).length;

  return (
    <div className="db-container">
      {/* Welcome Banner */}
      <div className="db-welcome-banner db-welcome-student">
        <div className="db-welcome-icon">
          <GraduationCap size={32} />
        </div>
        <div>
          <h2 className="db-welcome-title">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h2>
          <p className="db-welcome-sub">Here's an overview of your academic life.</p>
        </div>
        <div className="db-role-badge db-role-student">Student</div>
      </div>

      {/* Stats Row */}
      <div className="db-stats-row">
        <StatCard icon={<BookOpen size={20} />} label="Enrolled Courses" value={enrolledCourses.length} color="#3b82f6" />
        <StatCard icon={<AlertCircle size={20} />} label="Pending Fees" value={pendingFees} color="#ef4444" />
        <StatCard icon={<CheckCircle size={20} />} label="Paid Fees" value={paidFees} color="#10b981" />
        <StatCard icon={<Calendar size={20} />} label="Upcoming Events" value={events.length} color="#8b5cf6" />
      </div>

      <div className="db-grid-two">
        {/* Enrolled Courses */}
        <div className="db-card">
          <div className="db-card-header">
            <BookOpen size={18} color="#3b82f6" />
            <h3>My Courses</h3>
          </div>
          <div className="db-list">
            {enrolledCourses.map((course, i) => (
              <div key={i} className="db-list-item">
                <div>
                  <span className="db-code-badge">{course.code}</span>
                  <span className="db-item-name">{course.name}</span>
                </div>
                <div className="db-item-meta">
                  <span>{course.instructor}</span>
                  <span className={`db-seat-badge ${course.enrolled >= course.slots ? "db-seat-full" : "db-seat-ok"}`}>
                    {course.enrolled}/{course.slots}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fees */}
        <div className="db-card">
          <div className="db-card-header">
            <CreditCard size={18} color="#d97706" />
            <h3>Fee Status</h3>
          </div>
          <div className="db-list">
            {feeItems.map((fee, i) => (
              <div key={i} className="db-list-item">
                <div>
                  <span className="db-item-name">{fee.label}</span>
                  <span className="db-item-sub">{fee.status}</span>
                </div>
                <div className="db-item-right">
                  <span className="db-amount">{fee.amount}</span>
                  <span className={`db-status-badge ${fee.paid ? "db-status-paid" : "db-status-due"}`}>
                    {fee.paid ? "Paid" : "Due"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="db-card">
          <div className="db-card-header">
            <Calendar size={18} color="#8b5cf6" />
            <h3>Upcoming Events</h3>
          </div>
          <div className="db-list">
            {events.map((ev, i) => (
              <div key={i} className="db-list-item db-event-item">
                <div className={`db-event-date db-event-${ev.type}`}>
                  <Clock size={12} />
                  <span>{ev.date}</span>
                </div>
                <span className="db-item-name">{ev.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="db-card">
          <div className="db-card-header">
            <Bell size={18} color="#ef4444" />
            <h3>Latest Notices</h3>
          </div>
          <div className="db-list">
            {notices.map((notice, i) => (
              <div key={i} className="db-list-item">
                <div>
                  {notice.urgent && <span className="db-urgent-badge">Urgent</span>}
                  <span className="db-item-name">{notice.title}</span>
                  <span className="db-item-sub">{notice.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="db-card db-quick-links-card">
        <div className="db-card-header">
          <TrendingUp size={18} color="#10b981" />
          <h3>Quick Access</h3>
        </div>
        <div className="db-quick-links-grid">
          <QuickLink icon={<BookOpen size={20} />} label="Academic" href="/academic" color="#3b82f6" />
          <QuickLink icon={<Library size={20} />} label="Library" href="/library" color="#ef4444" />
          <QuickLink icon={<Heart size={20} />} label="Support" href="/support" color="#10b981" />
          <QuickLink icon={<Briefcase size={20} />} label="Alumni & Career" href="/alumni" color="#8b5cf6" />
        </div>
      </div>
    </div>
  );
}
