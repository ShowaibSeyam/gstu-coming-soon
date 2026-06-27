"use client";

import { useEffect, useState } from "react";
import TeacherDashboard from "./TeacherDashboard";
import {
  Users, Shield, ChevronDown, Check, X, Bell,
  BookOpen, Clock, Book, Award, FileText, CheckCircle2,
  AlertCircle, RefreshCw, ClipboardCheck, LayoutGrid,
  Trash2, Plus, DollarSign, Calendar,
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const ROLES = ["student", "teacher", "superadmin"];

const ROLE_COLORS = {
  student:    { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
  teacher:    { bg: "rgba(16,185,129,0.15)",  color: "#10b981" },
  superadmin: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

const CATEGORY_META = {
  syllabus:  { label: "Syllabus",        icon: <BookOpen size={15} />,    color: "#3b82f6" },
  schedule:  { label: "Class Schedule",  icon: <Clock size={15} />,       color: "#d97706" },
  books:     { label: "Books",           icon: <Book size={15} />,        color: "#ef4444" },
  results:   { label: "Exam Results",    icon: <Award size={15} />,       color: "#8b5cf6" },
  notices:   { label: "Notices",         icon: <Bell size={15} />,        color: "#f59e0b" },
  materials: { label: "Study Materials", icon: <FileText size={15} />,    color: "#10b981" },
};

// ── Role Selector ─────────────────────────────────────────────────
function RoleSelector({ userId, currentRole, onRoleChange }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (role) => {
    setOpen(false);
    if (role === currentRole) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/superadmin/users/${userId}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (json.success) onRoleChange(userId, role);
    } finally {
      setSaving(false);
    }
  };

  const styles = ROLE_COLORS[currentRole] || ROLE_COLORS.student;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="db-role-selector-btn"
        style={{ background: styles.bg, color: styles.color, borderColor: styles.color }}
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
      >
        {saving ? "Saving…" : currentRole}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="db-role-dropdown">
          {ROLES.map((r) => (
            <button key={r} className="db-role-option" onClick={() => handleSelect(r)}>
              {r === currentRole && <Check size={12} color="#10b981" />}
              <span>{r}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── User Management Tab ───────────────────────────────────────────
function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    fetch(`${API}/api/superadmin/users`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = (id, newRole) => {
    setUsers((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, role: newRole } : u)));
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="db-loading">
        <div className="loading-spinner" />
        <span>Loading users…</span>
      </div>
    );
  }

  return (
    <div className="db-tab-content">
      <div className="db-card">
        <div className="db-card-header">
          <Users size={18} color="#ef4444" />
          <h3>User Management</h3>
          <span className="db-count-badge">{users.length} users</span>
        </div>

        <div style={{ padding: "0 1.5rem 1rem" }}>
          <input
            className="db-form-input"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const styles = ROLE_COLORS[u.role] || ROLE_COLORS.student;
                const uid = u._id?.toString() || u.id;
                return (
                  <tr key={uid}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div className="db-user-avatar">
                          {(u.name || u.email || "?")[0].toUpperCase()}
                        </div>
                        {u.name || "—"}
                      </div>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{u.email}</td>
                    <td>
                      <span
                        className="db-role-badge-sm"
                        style={{ background: styles.bg, color: styles.color }}
                      >
                        {u.role || "student"}
                      </span>
                    </td>
                    <td>
                      <RoleSelector
                        userId={uid}
                        currentRole={u.role || "student"}
                        onRoleChange={handleRoleChange}
                      />
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────
function RejectModal({ item, type, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="db-modal-overlay" onClick={onCancel}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-header">
          <AlertCircle size={20} color="#ef4444" />
          <h3>Reject Submission</h3>
        </div>
        <p className="db-modal-desc">
          Optionally provide a reason so the teacher knows what to fix.
        </p>
        <textarea
          className="db-form-input db-form-textarea"
          placeholder="Reason for rejection (optional)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          autoFocus
        />
        <div className="db-modal-actions">
          <button className="db-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="db-modal-reject" onClick={() => onConfirm(reason)}>
            <X size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Approvals Tab ─────────────────────────────────────────────────
function ApprovalsTab() {
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null); // { type, item }
  const [processing, setProcessing] = useState(null); // "type-id"

  const fetchPending = () => {
    fetch(`${API}/api/superadmin/pending`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setPending(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const totalPending = pending
    ? Object.values(pending).reduce((s, arr) => s + arr.length, 0)
    : 0;

  const handleApprove = async (type, id) => {
    const key = `${type}-${id}`;
    setProcessing(key);
    try {
      const res = await fetch(`${API}/api/superadmin/approve/${type}/${id}`, {
        method: "PATCH", credentials: "include",
      });
      const json = await res.json();
      if (json.success) fetchPending();
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    const { type, item } = rejectTarget;
    setRejectTarget(null);
    const key = `${type}-${item.id}`;
    setProcessing(key);
    try {
      await fetch(`${API}/api/superadmin/reject/${type}/${item.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchPending();
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="db-loading">
        <div className="loading-spinner" />
        <span>Loading pending approvals…</span>
      </div>
    );
  }

  // Helper: summary text for item
  const itemSummary = (type, item) => {
    switch (type) {
      case "syllabus":  return `${item.code} — ${item.name} (${item.semester})`;
      case "schedule":  return `${item.course} | ${item.day} ${item.time} | ${item.room}`;
      case "books":     return `${item.title} by ${item.author} (${item.copies} copies)`;
      case "results":   return `${item.student} | ${item.course} | Grade: ${item.grade} (${item.marks})`;
      case "notices":   return item.title;
      case "materials": return `${item.title} [${item.type}] — ${item.course || "No course"}`;
      default: return JSON.stringify(item);
    }
  };

  return (
    <div className="db-tab-content">
      {/* Banner */}
      <div className="db-approvals-banner">
        <div className="db-approvals-banner-left">
          <ClipboardCheck size={24} />
          <div>
            <h3>Pending Approvals</h3>
            <p>Review and approve or reject content submitted by teachers.</p>
          </div>
        </div>
        <div className="db-approvals-banner-right">
          <span className="db-pending-total">{totalPending}</span>
          <span className="db-pending-label">items pending</span>
          <button className="db-refresh-btn" onClick={fetchPending}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {totalPending === 0 && (
        <div className="db-approvals-empty">
          <CheckCircle2 size={48} color="#10b981" />
          <h3>All caught up!</h3>
          <p>No pending submissions from teachers right now.</p>
        </div>
      )}

      {/* Grouped by category */}
      {Object.entries(CATEGORY_META).map(([type, meta]) => {
        const items = pending?.[type] || [];
        if (items.length === 0) return null;
        return (
          <div key={type} className="db-card">
            <div className="db-card-header">
              <span style={{ color: meta.color }}>{meta.icon}</span>
              <h3>{meta.label}</h3>
              <span className="db-count-badge db-pending-badge">{items.length} pending</span>
            </div>
            <div className="db-approval-list">
              {items.map((item) => {
                const key = `${type}-${item.id}`;
                const isProcessing = processing === key;
                return (
                  <div key={item.id} className="db-approval-item">
                    <div className="db-approval-item-left">
                      <div className="db-approval-avatar" style={{ background: meta.color + "22", color: meta.color }}>
                        {meta.icon}
                      </div>
                      <div className="db-approval-info">
                        <span className="db-approval-summary">{itemSummary(type, item)}</span>
                        {(type === "notices" && item.body) && (
                          <p className="db-approval-body">{item.body}</p>
                        )}
                        {(type === "materials" && item.url) && (
                          <a href={item.url} target="_blank" rel="noreferrer" className="db-approval-link">
                            View Material ↗
                          </a>
                        )}
                        <span className="db-approval-meta">
                          Submitted by <strong>{item.addedBy || item.teacher}</strong> · {item.updated || item.date || ""}
                        </span>
                      </div>
                    </div>
                    <div className="db-approval-actions">
                      <button
                        className="db-approve-btn"
                        disabled={isProcessing}
                        onClick={() => handleApprove(type, item.id)}
                      >
                        <CheckCircle2 size={14} />
                        {isProcessing ? "…" : "Approve"}
                      </button>
                      <button
                        className="db-reject-btn"
                        disabled={isProcessing}
                        onClick={() => setRejectTarget({ type, item })}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          item={rejectTarget.item}
          type={rejectTarget.type}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
// ── Admin Panel Tab ───────────────────────────────────────────────
function AdminPanelTab() {
  const [courses,  setCourses]  = useState([]);
  const [fees,     setFees]     = useState([]);
  const [events,   setEvents]   = useState([]);
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [section,  setSection]  = useState("courses");

  // Add form states
  const [courseForm, setCourseForm] = useState({ code: "", name: "", credits: "3", instructor: "", slots: "30" });
  const [feeForm,    setFeeForm]    = useState({ label: "", amount: "", status: "", paid: false });
  const [eventForm,  setEventForm]  = useState({ date: "", label: "", type: "holiday" });
  const [noticeForm, setNoticeForm] = useState({ title: "", urgent: false });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash]   = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 2500); };

  const fetchAll = async () => {
    setLoading(true);
    const [c, f, e, n] = await Promise.all([
      fetch(`${API}/api/superadmin/admin/courses`,  { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/api/superadmin/admin/fees`,     { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/api/superadmin/admin/events`,   { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/api/superadmin/admin/notices`,  { credentials: "include" }).then(r => r.json()),
    ]);
    setCourses(c.courses || []);
    setFees(f.feeItems || []);
    setEvents(e.events || []);
    setNotices(n.notices || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const del = async (url) => {
    await fetch(`${API}${url}`, { method: "DELETE", credentials: "include" });
    fetchAll();
  };

  const post = async (url, body) => {
    setSaving(true);
    const res = await fetch(`${API}${url}`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    return res.json();
  };

  const patch = async (url, body = {}) => {
    await fetch(`${API}${url}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchAll();
  };

  const SECTIONS = [
    { id: "courses", label: "Courses",  icon: <BookOpen size={15} />,   color: "#3b82f6" },
    { id: "fees",    label: "Fees",     icon: <DollarSign size={15} />, color: "#d97706" },
    { id: "events",  label: "Events",   icon: <Calendar size={15} />,   color: "#8b5cf6" },
    { id: "notices", label: "Notices",  icon: <Bell size={15} />,       color: "#ef4444" },
  ];

  if (loading) return (
    <div className="db-loading"><div className="loading-spinner" /><span>Loading admin data…</span></div>
  );

  return (
    <div className="db-tab-content">
      {flash && <div className="db-flash-msg">{flash}</div>}

      {/* Section pills */}
      <div className="db-admin-sections">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`db-admin-section-btn ${section === s.id ? "db-admin-section-active" : ""}`}
            style={{ "--sec-color": s.color }}
            onClick={() => setSection(s.id)}
          >
            {s.icon} {s.label}
            <span className="db-admin-count">
              { s.id === "courses" ? courses.length
              : s.id === "fees"    ? fees.length
              : s.id === "events"  ? events.length
              : notices.length }
            </span>
          </button>
        ))}
      </div>

      {/* ── COURSES ── */}
      {section === "courses" && (
        <>
          <div className="db-card">
            <div className="db-card-header"><BookOpen size={18} color="#3b82f6" /><h3>Add Course</h3></div>
            <form className="db-add-form" onSubmit={async e => {
              e.preventDefault();
              const r = await post("/api/superadmin/admin/courses", courseForm);
              if (r.success) { fetchAll(); setCourseForm({ code: "", name: "", credits: "3", instructor: "", slots: "30" }); showFlash("✅ Course added!"); }
            }}>
              <div className="db-form-grid">
                {[{k:"code",l:"Course Code",p:"CS501"},{k:"name",l:"Course Name",p:"Machine Learning"},{k:"credits",l:"Credits",p:"3",t:"number"},{k:"instructor",l:"Instructor",p:"Dr. Name"},{k:"slots",l:"Total Slots",p:"30",t:"number"}].map(f=>(
                  <div key={f.k} className="db-form-field">
                    <label className="db-form-label">{f.l}</label>
                    <input className="db-form-input" type={f.t||"text"} placeholder={f.p} value={courseForm[f.k]} onChange={e=>setCourseForm(p=>({...p,[f.k]:e.target.value}))} required />
                  </div>
                ))}
              </div>
              <div className="db-form-footer">
                <button type="submit" className="db-submit-btn" disabled={saving}><Plus size={14} /> {saving?"Adding…":"Add Course"}</button>
              </div>
            </form>
          </div>
          <div className="db-card">
            <div className="db-card-header"><BookOpen size={18} color="#3b82f6" /><h3>Courses</h3><span className="db-count-badge">{courses.length}</span></div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Instructor</th><th>Seats</th><th></th></tr></thead>
                <tbody>
                  {courses.map(c=>(
                    <tr key={c.id}>
                      <td><span className="db-code-badge">{c.code}</span></td>
                      <td>{c.name}</td>
                      <td>{c.credits}</td>
                      <td style={{color:"#94a3b8"}}>{c.instructor}</td>
                      <td>
                        <div className="db-seat-mini">
                          <div className="db-seat-mini-bar" style={{width:`${Math.min((c.enrolled/c.slots)*100,100)}%`,background:c.enrolled>=c.slots?"#ef4444":"#3b82f6"}} />
                        </div>
                        <span style={{fontSize:"0.75rem",color:"#94a3b8"}}>{c.enrolled}/{c.slots}</span>
                      </td>
                      <td><button className="db-del-btn" onClick={()=>del(`/api/superadmin/admin/courses/${c.id}`)}><Trash2 size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── FEES ── */}
      {section === "fees" && (
        <>
          <div className="db-card">
            <div className="db-card-header"><DollarSign size={18} color="#d97706"/><h3>Add Fee Item</h3></div>
            <form className="db-add-form" onSubmit={async e=>{
              e.preventDefault();
              const r = await post("/api/superadmin/admin/fees", feeForm);
              if(r.success){fetchAll();setFeeForm({label:"",amount:"",status:"",paid:false});showFlash("✅ Fee item added!");}
            }}>
              <div className="db-form-grid">
                <div className="db-form-field"><label className="db-form-label">Label</label><input className="db-form-input" placeholder="e.g. Lab Fee" value={feeForm.label} onChange={e=>setFeeForm(p=>({...p,label:e.target.value}))} required/></div>
                <div className="db-form-field"><label className="db-form-label">Amount</label><input className="db-form-input" placeholder="৳ 5,000" value={feeForm.amount} onChange={e=>setFeeForm(p=>({...p,amount:e.target.value}))} required/></div>
                <div className="db-form-field"><label className="db-form-label">Status / Deadline</label><input className="db-form-input" placeholder="Due: June 15, 2026" value={feeForm.status} onChange={e=>setFeeForm(p=>({...p,status:e.target.value}))}/></div>
                <div className="db-form-field" style={{display:"flex",alignItems:"center",gap:".5rem",paddingTop:"1.5rem"}}>
                  <input type="checkbox" id="fee-paid" checked={feeForm.paid} onChange={e=>setFeeForm(p=>({...p,paid:e.target.checked}))}/>
                  <label htmlFor="fee-paid" className="db-form-label" style={{margin:0}}>Mark as Paid</label>
                </div>
              </div>
              <div className="db-form-footer"><button type="submit" className="db-submit-btn" disabled={saving}><Plus size={14}/> {saving?"Adding…":"Add Fee"}</button></div>
            </form>
          </div>
          <div className="db-card">
            <div className="db-card-header"><DollarSign size={18} color="#d97706"/><h3>Fee Items</h3><span className="db-count-badge">{fees.length}</span></div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Label</th><th>Amount</th><th>Status</th><th>Paid</th><th></th></tr></thead>
                <tbody>
                  {fees.map(f=>(
                    <tr key={f.id}>
                      <td>{f.label}</td>
                      <td style={{fontWeight:600}}>{f.amount}</td>
                      <td style={{color:"#94a3b8",fontSize:"0.82rem"}}>{f.status}</td>
                      <td>
                        <button
                          className={`db-toggle-btn ${f.paid?"db-toggle-on":"db-toggle-off"}`}
                          onClick={()=>patch(`/api/superadmin/admin/fees/${f.id}/paid`)}
                        >{f.paid?"Paid":"Unpaid"}</button>
                      </td>
                      <td><button className="db-del-btn" onClick={()=>del(`/api/superadmin/admin/fees/${f.id}`)}><Trash2 size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── EVENTS ── */}
      {section === "events" && (
        <>
          <div className="db-card">
            <div className="db-card-header"><Calendar size={18} color="#8b5cf6"/><h3>Add Event</h3></div>
            <form className="db-add-form" onSubmit={async e=>{
              e.preventDefault();
              const r=await post("/api/superadmin/admin/events",eventForm);
              if(r.success){fetchAll();setEventForm({date:"",label:"",type:"holiday"});showFlash("✅ Event added!");}
            }}>
              <div className="db-form-grid">
                <div className="db-form-field"><label className="db-form-label">Date</label><input className="db-form-input" placeholder="e.g. July 15" value={eventForm.date} onChange={e=>setEventForm(p=>({...p,date:e.target.value}))} required/></div>
                <div className="db-form-field"><label className="db-form-label">Label</label><input className="db-form-input" placeholder="e.g. Final Exams Begin" value={eventForm.label} onChange={e=>setEventForm(p=>({...p,label:e.target.value}))} required/></div>
                <div className="db-form-field"><label className="db-form-label">Type</label>
                  <select className="db-form-input" value={eventForm.type} onChange={e=>setEventForm(p=>({...p,type:e.target.value}))}>
                    <option value="exam">Exam</option><option value="deadline">Deadline</option><option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>
              <div className="db-form-footer"><button type="submit" className="db-submit-btn" disabled={saving}><Plus size={14}/> {saving?"Adding…":"Add Event"}</button></div>
            </form>
          </div>
          <div className="db-card">
            <div className="db-card-header"><Calendar size={18} color="#8b5cf6"/><h3>Academic Calendar</h3><span className="db-count-badge">{events.length}</span></div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Date</th><th>Event</th><th>Type</th><th></th></tr></thead>
                <tbody>
                  {events.map(ev=>{
                    const typeColor={exam:"#ef4444",deadline:"#d97706",holiday:"#10b981"}[ev.type]||"#94a3b8";
                    return(
                      <tr key={ev.id}>
                        <td><span className="db-code-badge">{ev.date}</span></td>
                        <td>{ev.label}</td>
                        <td><span className="db-status-badge" style={{background:typeColor+"22",color:typeColor,border:`1px solid ${typeColor}44`}}>{ev.type}</span></td>
                        <td><button className="db-del-btn" onClick={()=>del(`/api/superadmin/admin/events/${ev.id}`)}><Trash2 size={14}/></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── NOTICES ── */}
      {section === "notices" && (
        <>
          <div className="db-card">
            <div className="db-card-header"><Bell size={18} color="#ef4444"/><h3>Post Admin Notice</h3></div>
            <form className="db-add-form" onSubmit={async e=>{
              e.preventDefault();
              const r=await post("/api/superadmin/admin/notices",noticeForm);
              if(r.success){fetchAll();setNoticeForm({title:"",urgent:false});showFlash("✅ Notice posted!");}
            }}>
              <div className="db-form-grid">
                <div className="db-form-field db-form-field-full"><label className="db-form-label">Notice Title</label><input className="db-form-input" placeholder="e.g. Fee submission deadline extended" value={noticeForm.title} onChange={e=>setNoticeForm(p=>({...p,title:e.target.value}))} required/></div>
                <div className="db-form-field" style={{display:"flex",alignItems:"center",gap:".5rem",paddingTop:"1.5rem"}}>
                  <input type="checkbox" id="notice-urgent" checked={noticeForm.urgent} onChange={e=>setNoticeForm(p=>({...p,urgent:e.target.checked}))}/>
                  <label htmlFor="notice-urgent" className="db-form-label" style={{margin:0,color:"#ef4444"}}>🔴 Mark as Urgent</label>
                </div>
              </div>
              <div className="db-form-footer"><button type="submit" className="db-submit-btn" disabled={saving}><Plus size={14}/> {saving?"Posting…":"Post Notice"}</button></div>
            </form>
          </div>
          <div className="db-card">
            <div className="db-card-header"><Bell size={18} color="#ef4444"/><h3>Admin Notices</h3><span className="db-count-badge">{notices.length}</span></div>
            <div className="db-notices-list">
              {notices.map(n=>(
                <div key={n.id} className={`db-notice-item ${n.urgent?"db-notice-rejected":"db-notice-approved"}`}>
                  <div className="db-notice-top">
                    <span className="db-notice-title">{n.title}{n.urgent&&<span className="db-status-badge db-status-rejected" style={{marginLeft:".5rem"}}>Urgent</span>}</span>
                    <div className="db-notice-actions">
                      <span style={{fontSize:"0.75rem",color:"#475569"}}>{n.date}</span>
                      <button className="db-del-btn" onClick={()=>del(`/api/superadmin/admin/notices/${n.id}`)}><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {notices.length===0&&<div className="db-empty-state">No notices yet.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main SuperAdminDashboard ──────────────────────────────────────
export default function SuperAdminDashboard() {
  const [view, setView] = useState("academic");
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending count for badge
  useEffect(() => {
    fetch(`${API}/api/superadmin/pending`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const total = Object.values(d).reduce((s, arr) => s + arr.length, 0);
        setPendingCount(total);
      })
      .catch(() => {});
  }, [view]);

  return (
    <div>
      {/* View switcher */}
      <div className="db-superadmin-switcher">
        <button
          className={`db-switcher-btn ${view === "academic" ? "db-switcher-active" : ""}`}
          onClick={() => setView("academic")}
        >
          <Shield size={16} /> Academic
        </button>
        <button
          className={`db-switcher-btn ${view === "approvals" ? "db-switcher-active" : ""}`}
          onClick={() => setView("approvals")}
        >
          <ClipboardCheck size={16} />
          Approvals
          {pendingCount > 0 && (
            <span className="db-switcher-badge">{pendingCount}</span>
          )}
        </button>
        <button
          className={`db-switcher-btn ${view === "admin" ? "db-switcher-active" : ""}`}
          onClick={() => setView("admin")}
        >
          <LayoutGrid size={16} /> Admin Panel
        </button>
        <button
          className={`db-switcher-btn ${view === "users" ? "db-switcher-active" : ""}`}
          onClick={() => setView("users")}
        >
          <Users size={16} /> Users
        </button>
      </div>

      {view === "academic" && (
        <TeacherDashboard isSuperAdmin={true} />
      )}

      {view === "approvals" && (
        <div className="db-container">
          <div className="db-welcome-banner db-welcome-super">
            <div className="db-welcome-icon">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h2 className="db-welcome-title">Content Approvals 📋</h2>
              <p className="db-welcome-sub">Review and approve or reject teacher-submitted content.</p>
            </div>
            <div className="db-role-badge db-role-super">Super Admin</div>
          </div>
          <ApprovalsTab />
        </div>
      )}

      {view === "admin" && (
        <div className="db-container">
          <div className="db-welcome-banner db-welcome-super">
            <div className="db-welcome-icon"><LayoutGrid size={32} /></div>
            <div>
              <h2 className="db-welcome-title">Admin Panel 🛠️</h2>
              <p className="db-welcome-sub">Manage courses, fees, events and notices for the entire university.</p>
            </div>
            <div className="db-role-badge db-role-super">Super Admin</div>
          </div>
          <AdminPanelTab />
        </div>
      )}

      {view === "users" && (
        <>
          {/* Super Admin banner for user view */}
          <div className="db-container">
            <div className="db-welcome-banner db-welcome-super">
              <div className="db-welcome-icon">
                <Shield size={32} />
              </div>
              <div>
                <h2 className="db-welcome-title">User Management 👥</h2>
                <p className="db-welcome-sub">Assign teacher or student roles to any registered user.</p>
              </div>
              <div className="db-role-badge db-role-super">Super Admin</div>
            </div>
            <UserManagementTab />
          </div>
        </>
      )}
    </div>
  );
}
