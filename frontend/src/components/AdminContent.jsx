"use client";

import { useState, useEffect } from "react";
import { Info, Bell, DollarSign, Calendar, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function eventColor(type) {
  if (type === "exam") return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" };
  if (type === "deadline") return { bg: "rgba(217,119,6,0.1)", color: "#d97706" };
  return { bg: "rgba(16,185,129,0.1)", color: "#10b981" };
}

function CourseRegister({ courses = [], onRegister }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#d97706" }}><Info size={20} /> Course Register</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Course</th><th>Credits</th><th>Instructor</th><th>Availability</th><th>Action</th></tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const full = c.enrolled >= c.slots;
              return (
                <tr key={c.code}>
                  <td><span className="badge badge-amber">{c.code}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.credits}</td>
                  <td style={{ color: "#94a3b8" }}>{c.instructor}</td>
                  <td>
                    <div className="seat-bar">
                      <div className="seat-fill" style={{ width: `${(c.enrolled / c.slots) * 100}%`, background: full ? "#ef4444" : "#d97706" }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.enrolled}/{c.slots}</span>
                  </td>
                  <td>
                    <button 
                      className="action-btn" 
                      disabled={full} 
                      onClick={() => onRegister(c.code)}
                      style={{ opacity: full ? 0.4 : 1 }}
                    >
                      {full ? "Full" : "Register"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                  No courses available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeesAndCalendar({ feeItems = [], events = [] }) {
  return (
    <div className="two-col-grid">
      <div className="content-block">
        <h2 className="block-heading" style={{ color: "#d97706" }}><DollarSign size={20} /> Fees</h2>
        <div className="fee-list">
          {feeItems.map((fee, i) => (
            <div key={i} className="fee-item">
              <div>
                <div className="fee-label">{fee.label}</div>
                <div className="fee-status" style={{ color: fee.paid ? "#10b981" : "#ef4444" }}>{fee.status}</div>
              </div>
              <div className="fee-amount" style={{ color: fee.paid ? "#94a3b8" : "#f8fafc" }}>{fee.amount}</div>
            </div>
          ))}
          {feeItems.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
              No fees details found.
            </div>
          )}
        </div>
      </div>

      <div className="content-block">
        <h2 className="block-heading" style={{ color: "#d97706" }}><Calendar size={20} /> Academic Calendar</h2>
        <div className="event-list">
          {events.map((ev, i) => {
            const { bg, color } = eventColor(ev.type);
            return (
              <div key={i} className="event-item">
                <div className="event-date-badge" style={{ background: bg, color }}>{ev.date}</div>
                <span className="event-label">{ev.label}</span>
              </div>
            );
          })}
          {events.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
              No events scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoticesSection({ notices = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#d97706" }}><Bell size={20} /> Notices &amp; Alerts</h2>
      <div className="notice-list">
        {notices.map((n, i) => (
          <div key={i} className={`notice-item ${n.urgent ? "notice-urgent" : ""}`}>
            <div className="notice-icon">
              {n.urgent ? <AlertCircle size={18} color="#ef4444" /> : <Bell size={18} color="#d97706" />}
            </div>
            <div className="notice-content">
              <div className="notice-title">{n.title}</div>
              <div className="notice-date">{n.date}</div>
            </div>
            {n.urgent && <span className="badge badge-red">Urgent</span>}
          </div>
        ))}
        {notices.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
            No recent notices.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const [data, setData] = useState({ courses: [], feeItems: [], events: [], notices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      });
  }, []);

  const handleRegister = (courseCode) => {
    fetch(`${API_URL}/admin/courses/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: courseCode }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Registration failed");
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          setData((prev) => ({
            ...prev,
            courses: prev.courses.map((c) =>
              c.code === courseCode ? { ...c, enrolled: result.course.enrolled } : c
            ),
          }));
          alert(`Successfully registered for course: ${courseCode}`);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Could not complete registration.");
      });
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "200px", background: "transparent" }}>
        <div className="loading-spinner" />
        <span>Loading Admin Information…</span>
      </div>
    );
  }

  return (
    <>
      <CourseRegister courses={data.courses} onRegister={handleRegister} />
      <FeesAndCalendar feeItems={data.feeItems} events={data.events} />
      <NoticesSection notices={data.notices} />
    </>
  );
}
