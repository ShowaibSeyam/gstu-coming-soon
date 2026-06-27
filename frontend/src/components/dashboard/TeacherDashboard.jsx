"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen, Clock, Book, Award, Plus, Trash2,
  GraduationCap, Check, X, Bell, FileText,
  ExternalLink, AlertCircle, Clock3, CheckCircle2,
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];
const MATERIAL_TYPES = ["Slides", "Lecture Notes", "PDF", "Assignment", "Lab Manual", "Reference"];

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status, reason }) {
  const cfg = {
    pending:  { icon: <Clock3 size={11} />,       label: "Pending",  cls: "db-status-pending" },
    approved: { icon: <CheckCircle2 size={11} />, label: "Approved", cls: "db-status-approved" },
    rejected: { icon: <AlertCircle size={11} />,  label: "Rejected", cls: "db-status-rejected" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span className={`db-status-badge ${c.cls}`} title={status === "rejected" && reason ? `Reason: ${reason}` : ""}>
      {c.icon} {c.label}
      {status === "rejected" && reason && <span className="db-rejected-reason"> — {reason}</span>}
    </span>
  );
}

// ── Tab Button ────────────────────────────────────────────────────
function TabButton({ id, active, icon, label, onClick, pendingCount }) {
  return (
    <button
      className={`db-tab-btn ${active ? "db-tab-active" : ""}`}
      onClick={() => onClick(id)}
    >
      {icon}
      <span>{label}</span>
      {pendingCount > 0 && <span className="db-tab-pending-dot">{pendingCount}</span>}
    </button>
  );
}

// ── Add Form ──────────────────────────────────────────────────────
function AddForm({ fields, onSubmit, loading }) {
  const [vals, setVals] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""]))
  );
  const [success, setSuccess] = useState(false);

  const handleChange = (name, value) => setVals((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(vals);
    setVals(Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""])));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <form className="db-add-form" onSubmit={handleSubmit}>
      <div className="db-form-grid">
        {fields.map((field) => (
          <div key={field.name} className={`db-form-field ${field.fullWidth ? "db-form-field-full" : ""}`}>
            <label className="db-form-label">{field.label}</label>
            {field.type === "select" ? (
              <select
                className="db-form-input"
                value={vals[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                className="db-form-input db-form-textarea"
                placeholder={field.placeholder || ""}
                value={vals[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={3}
              />
            ) : (
              <input
                className="db-form-input"
                type={field.type || "text"}
                placeholder={field.placeholder || ""}
                value={vals[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      <div className="db-form-footer">
        <button type="submit" className="db-submit-btn" disabled={loading}>
          {success ? <><Check size={15} /> Submitted for Approval!</> : <><Plus size={15} /> Submit</>}
        </button>
        {!success && (
          <span className="db-form-hint">
            <Clock3 size={12} /> Submitted items need SuperAdmin approval before publishing
          </span>
        )}
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function TeacherDashboard({ isSuperAdmin = false }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("syllabus");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    fetch(`${API}/api/teacher/data`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const post = async (path, body) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (path) => {
    await fetch(`${API}${path}`, { method: "DELETE", credentials: "include" });
    fetchData();
  };

  const TABS = [
    { id: "syllabus",  label: "Syllabus",        icon: <BookOpen size={16} /> },
    { id: "schedule",  label: "Class Schedule",   icon: <Clock size={16} /> },
    { id: "books",     label: "Books",            icon: <Book size={16} /> },
    { id: "results",   label: "Exam Results",     icon: <Award size={16} /> },
    { id: "notices",   label: "Notices",          icon: <Bell size={16} /> },
    { id: "materials", label: "Study Materials",  icon: <FileText size={16} /> },
  ];

  if (loading) {
    return (
      <div className="db-loading">
        <div className="loading-spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const {
    teacherSyllabus = [],
    classSchedule = [],
    teacherBooks = [],
    examResults = [],
    teacherNotices = [],
    teacherMaterials = [],
  } = data || {};

  const pendingCounts = {
    syllabus:  teacherSyllabus.filter(x => x.status === "pending").length,
    schedule:  classSchedule.filter(x => x.status === "pending").length,
    books:     teacherBooks.filter(x => x.status === "pending").length,
    results:   examResults.filter(x => x.status === "pending").length,
    notices:   teacherNotices.filter(x => x.status === "pending").length,
    materials: teacherMaterials.filter(x => x.status === "pending").length,
  };

  return (
    <div className="db-container">
      {/* Welcome Banner */}
      <div className={`db-welcome-banner ${isSuperAdmin ? "db-welcome-super" : "db-welcome-teacher"}`}>
        <div className="db-welcome-icon">
          <GraduationCap size={32} />
        </div>
        <div>
          <h2 className="db-welcome-title">
            {isSuperAdmin ? "Super Admin Panel" : `Welcome, ${user?.name?.split(" ")[0] || "Teacher"}!`} 👋
          </h2>
          <p className="db-welcome-sub">
            {isSuperAdmin
              ? "Manage all academic content. Your submissions are auto-approved."
              : "Submit notices, materials, and academic content for SuperAdmin approval."}
          </p>
        </div>
        <div className={`db-role-badge ${isSuperAdmin ? "db-role-super" : "db-role-teacher"}`}>
          {isSuperAdmin ? "Super Admin" : "Teacher"}
        </div>
      </div>

      {/* Tabs */}
      <div className="db-tabs">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            label={tab.label}
            onClick={setActiveTab}
            pendingCount={pendingCounts[tab.id]}
          />
        ))}
      </div>

      {/* ── Syllabus Tab ── */}
      {activeTab === "syllabus" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <BookOpen size={18} color="#3b82f6" />
              <h3>Add New Syllabus Entry</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "code", label: "Course Code", placeholder: "e.g. CS501", required: true },
                { name: "name", label: "Course Name", placeholder: "e.g. Machine Learning", required: true },
                { name: "semester", label: "Semester", type: "select", options: SEMESTERS, required: true },
              ]}
              onSubmit={(vals) => post("/api/teacher/syllabus", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <BookOpen size={18} color="#3b82f6" />
              <h3>Syllabus List</h3>
              <span className="db-count-badge">{teacherSyllabus.length}</span>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Code</th><th>Course Name</th><th>Semester</th><th>Updated</th><th>Added By</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {teacherSyllabus.map((s) => (
                    <tr key={s.id}>
                      <td><span className="db-code-badge">{s.code}</span></td>
                      <td>{s.name}</td>
                      <td>{s.semester}</td>
                      <td>{s.updated}</td>
                      <td>{s.addedBy}</td>
                      <td><StatusBadge status={s.status} reason={s.rejectedReason} /></td>
                      <td>
                        <button className="db-del-btn" onClick={() => del(`/api/teacher/syllabus/${s.id}`)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule Tab ── */}
      {activeTab === "schedule" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <Clock size={18} color="#d97706" />
              <h3>Add Class Schedule</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "course", label: "Course Code", placeholder: "e.g. CS301", required: true },
                { name: "day", label: "Day", type: "select", options: DAYS, required: true },
                { name: "time", label: "Time", placeholder: "e.g. 10:00 AM – 11:30 AM", required: true },
                { name: "room", label: "Room / Lab", placeholder: "e.g. Room 201", required: true },
              ]}
              onSubmit={(vals) => post("/api/teacher/schedule", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <Clock size={18} color="#d97706" />
              <h3>Class Schedule</h3>
              <span className="db-count-badge">{classSchedule.length}</span>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Course</th><th>Day</th><th>Time</th><th>Room</th><th>Teacher</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {classSchedule.map((s) => (
                    <tr key={s.id}>
                      <td><span className="db-code-badge">{s.course}</span></td>
                      <td>{s.day}</td>
                      <td>{s.time}</td>
                      <td>{s.room}</td>
                      <td>{s.teacher}</td>
                      <td><StatusBadge status={s.status} reason={s.rejectedReason} /></td>
                      <td>
                        <button className="db-del-btn" onClick={() => del(`/api/teacher/schedule/${s.id}`)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Books Tab ── */}
      {activeTab === "books" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <Book size={18} color="#ef4444" />
              <h3>Add Book</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "title", label: "Book Title", placeholder: "e.g. Clean Architecture", required: true },
                { name: "author", label: "Author", placeholder: "e.g. Robert C. Martin", required: true },
                { name: "copies", label: "Copies", type: "number", placeholder: "1", defaultValue: "1" },
              ]}
              onSubmit={(vals) => post("/api/teacher/books", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <Book size={18} color="#ef4444" />
              <h3>Books</h3>
              <span className="db-count-badge">{teacherBooks.length}</span>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Author</th><th>Copies</th><th>Availability</th><th>Added By</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {teacherBooks.map((b) => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.copies}</td>
                      <td>
                        <span className={`db-avail-badge ${b.available ? "db-avail-yes" : "db-avail-no"}`}>
                          {b.available ? "Available" : "Checked Out"}
                        </span>
                      </td>
                      <td>{b.addedBy}</td>
                      <td><StatusBadge status={b.status} reason={b.rejectedReason} /></td>
                      <td>
                        <button className="db-del-btn" onClick={() => del(`/api/teacher/books/${b.id}`)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Exam Results Tab ── */}
      {activeTab === "results" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <Award size={18} color="#8b5cf6" />
              <h3>Enter Exam Result</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "student", label: "Student Name", placeholder: "e.g. Rahim Hossain", required: true },
                { name: "studentId", label: "Student ID", placeholder: "e.g. CS-2021-001" },
                { name: "course", label: "Course Code", placeholder: "e.g. CS301", required: true },
                { name: "marks", label: "Marks", type: "number", placeholder: "0–100" },
                { name: "grade", label: "Grade", type: "select", options: GRADES, required: true },
                { name: "semester", label: "Semester", placeholder: "e.g. Spring 2026" },
              ]}
              onSubmit={(vals) => post("/api/teacher/results", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <Award size={18} color="#8b5cf6" />
              <h3>Exam Results</h3>
              <span className="db-count-badge">{examResults.length}</span>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Student</th><th>ID</th><th>Course</th><th>Marks</th><th>Grade</th><th>Semester</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.map((r) => (
                    <tr key={r.id}>
                      <td>{r.student}</td>
                      <td><span className="db-code-badge">{r.studentId}</span></td>
                      <td>{r.course}</td>
                      <td>{r.marks}</td>
                      <td>
                        <span className={`db-grade-badge db-grade-${r.grade.replace("+", "p").replace("-", "m")}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td>{r.semester}</td>
                      <td><StatusBadge status={r.status} reason={r.rejectedReason} /></td>
                      <td>
                        <button className="db-del-btn" onClick={() => del(`/api/teacher/results/${r.id}`)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Notices Tab ── */}
      {activeTab === "notices" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <Bell size={18} color="#f59e0b" />
              <h3>Post New Notice / Announcement</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "title", label: "Notice Title", placeholder: "e.g. Mid-term Exam Schedule", required: true },
                { name: "body", label: "Notice Details", type: "textarea", placeholder: "Write the full notice here…", required: true, fullWidth: true },
              ]}
              onSubmit={(vals) => post("/api/teacher/notices", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <Bell size={18} color="#f59e0b" />
              <h3>My Notices</h3>
              <span className="db-count-badge">{teacherNotices.length}</span>
            </div>
            <div className="db-notices-list">
              {teacherNotices.length === 0 && (
                <div className="db-empty-state">No notices yet. Post your first notice above.</div>
              )}
              {teacherNotices.map((n) => (
                <div key={n.id} className={`db-notice-item db-notice-${n.status}`}>
                  <div className="db-notice-top">
                    <span className="db-notice-title">{n.title}</span>
                    <div className="db-notice-actions">
                      <StatusBadge status={n.status} reason={n.rejectedReason} />
                      <button className="db-del-btn" onClick={() => del(`/api/teacher/notices/${n.id}`)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="db-notice-body">{n.body}</p>
                  <div className="db-notice-meta">
                    <span>{n.addedBy}</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Materials Tab ── */}
      {activeTab === "materials" && (
        <div className="db-tab-content">
          <div className="db-card">
            <div className="db-card-header">
              <FileText size={18} color="#10b981" />
              <h3>Upload Study Material</h3>
            </div>
            <AddForm
              loading={submitting}
              fields={[
                { name: "title", label: "Material Title", placeholder: "e.g. Lecture 3 – Linked Lists", required: true },
                { name: "course", label: "Course Code", placeholder: "e.g. CS301" },
                { name: "type", label: "Type", type: "select", options: MATERIAL_TYPES },
                { name: "url", label: "File / Drive Link", placeholder: "https://drive.google.com/…", required: true },
                { name: "description", label: "Description (optional)", placeholder: "Brief description of the material", fullWidth: true },
              ]}
              onSubmit={(vals) => post("/api/teacher/materials", vals)}
            />
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <FileText size={18} color="#10b981" />
              <h3>My Materials</h3>
              <span className="db-count-badge">{teacherMaterials.length}</span>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Course</th><th>Type</th><th>Added By</th><th>Date</th><th>Status</th><th>Link</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {teacherMaterials.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td><span className="db-code-badge">{m.course || "—"}</span></td>
                      <td>{m.type}</td>
                      <td>{m.addedBy}</td>
                      <td style={{ color: "#64748b", fontSize: "0.82rem" }}>{m.date}</td>
                      <td><StatusBadge status={m.status} reason={m.rejectedReason} /></td>
                      <td>
                        <a href={m.url} target="_blank" rel="noreferrer" className="db-link-btn">
                          <ExternalLink size={13} />
                        </a>
                      </td>
                      <td>
                        <button className="db-del-btn" onClick={() => del(`/api/teacher/materials/${m.id}`)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
