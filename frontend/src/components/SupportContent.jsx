"use client";

import { useState, useEffect } from "react";
import { HelpCircle, GraduationCap, Heart, Monitor, CheckCircle, Phone, Mail, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function badgeClass(status) {
  if (status === "Resolved")    return "badge-green";
  if (status === "In Progress") return "badge-amber";
  return "badge-red";
}

function getMhInstanceIcon(iconName) {
  switch (iconName) {
    case "Heart": return <Heart size={20} />;
    case "Phone": return <Phone size={20} />;
    case "Clock": return <Clock size={20} />;
    case "Mail": return <Mail size={20} />;
    default: return <Heart size={20} />;
  }
}

function ITHelpDesk({ tickets = [], onSubmitTicket }) {
  const [form, setForm] = useState({ issue: "", category: "IT", details: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmitTicket(form.issue, form.category, form.details);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ issue: "", category: "IT", details: "" });
  }

  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#10b981" }}><HelpCircle size={20} /> IT Help Desk</h2>
      <div className="two-col-grid">
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#cbd5e1" }}>Submit a Ticket</h3>
          {submitted && <div className="success-banner"><CheckCircle size={18} /> Ticket submitted! We will respond within 24 hours.</div>}
          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label>Issue Title</label>
              <input type="text" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Briefly describe your issue" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>IT</option><option>Network</option><option>Account</option><option>Software</option><option>Hardware</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Details</label>
              <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Provide more details..." rows={4} />
            </div>
            <button type="submit" className="submit-btn" style={{ background: "#10b981" }}>
              <Monitor size={16} /> Submit Ticket
            </button>
          </form>
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#cbd5e1" }}>Recent Tickets</h3>
          <div className="ticket-list">
            {tickets.map((t) => (
              <div key={t.id} className="ticket-item">
                <div className="ticket-header">
                  <span className="ticket-id">{t.id}</span>
                  <span className={`badge ${badgeClass(t.status)}`}>{t.status}</span>
                </div>
                <div className="ticket-issue">{t.issue}</div>
                <div className="ticket-meta">Created: {t.created} &bull; Priority: {t.priority}</div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                No active tickets.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScholarshipsSection({ scholarships = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#10b981" }}><GraduationCap size={20} /> Scholarships</h2>
      <div className="card-grid-2">
        {scholarships.map((s, i) => (
          <div key={i} className={`scholarship-card ${s.status === "Closed" ? "scholarship-closed" : ""}`}>
            <div className="scholarship-header">
              <h3 className="scholarship-name">{s.name}</h3>
              <span className={`badge ${s.status === "Open" ? "badge-green" : "badge-outline"}`}>{s.status}</span>
            </div>
            <div className="scholarship-details">
              <div><span>Amount:</span> <strong>{s.amount}</strong></div>
              <div><span>Min CGPA:</span> <strong>{s.cgpa}</strong></div>
              <div><span>Deadline:</span> <strong>{s.deadline}</strong></div>
            </div>
            <button className="action-btn" disabled={s.status === "Closed"} style={{ opacity: s.status === "Closed" ? 0.4 : 1 }}>
              {s.status === "Open" ? "Apply Now" : "Closed"}
            </button>
          </div>
        ))}
        {scholarships.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", width: "100%", padding: "1.5rem" }}>
            No scholarships listings found.
          </div>
        )}
      </div>
    </div>
  );
}

function MentalHealthSection({ mhResources = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#10b981" }}><Heart size={20} /> Mental Health Resources</h2>
      <div className="card-grid-2">
        {mhResources.map((r, i) => (
          <div key={i} className="mh-card">
            <div className="mh-icon" style={{ background: `${r.color}20`, color: r.color }}>{getMhInstanceIcon(r.iconName)}</div>
            <div>
              <h3 className="mh-title">{r.title}</h3>
              <p className="mh-desc">{r.desc}</p>
            </div>
          </div>
        ))}
        {mhResources.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", width: "100%", padding: "1.5rem" }}>
            No mental health resources listed.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportContent() {
  const [data, setData] = useState({ existingTickets: [], scholarships: [], mhResources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/support`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching support data:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmitTicket = (issue, category, details) => {
    fetch(`${API_URL}/support/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue, category, details }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ticket submission failed");
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          setData((prev) => ({
            ...prev,
            existingTickets: [result.ticket, ...prev.existingTickets],
          }));
        }
      })
      .catch((err) => {
        console.error("Error submitting ticket:", err);
        alert("Failed to submit ticket.");
      });
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "200px", background: "transparent" }}>
        <div className="loading-spinner" />
        <span>Loading Support Services…</span>
      </div>
    );
  }

  return (
    <>
      <ITHelpDesk tickets={data.existingTickets} onSubmitTicket={handleSubmitTicket} />
      <ScholarshipsSection scholarships={data.scholarships} />
      <MentalHealthSection mhResources={data.mhResources} />
    </>
  );
}
