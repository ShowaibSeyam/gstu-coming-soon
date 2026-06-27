"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Download, ExternalLink, GraduationCap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function SyllabusSection({ items = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#3b82f6" }}>
        <FileText size={20} /> Syllabus &amp; Notes
      </h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Semester</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.code}>
                <td><span className="badge badge-blue">{item.code}</span></td>
                <td>{item.name}</td>
                <td>{item.semester}</td>
                <td style={{ color: "#94a3b8" }}>{item.updated}</td>
                <td>
                  <button className="action-btn"><Download size={14} /> Download</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                  No syllabus items available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PYQSection({ items = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#3b82f6" }}>
        <FileText size={20} /> Previous Year Question Papers
      </h2>
      <div className="card-grid-3">
        {items.map((item, i) => (
          <div key={i} className="mini-card">
            <div className="mini-card-header">
              <GraduationCap size={18} style={{ color: "#3b82f6" }} />
              <span className="badge badge-blue">{item.year}</span>
            </div>
            <h3 className="mini-card-title">{item.subject}</h3>
            <p className="mini-card-meta">{item.exam} Exam &bull; {item.pages} pages</p>
            <button className="action-btn w-full"><Download size={14} /> Download PDF</button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
          No previous year question papers available.
        </div>
      )}
    </div>
  );
}

function EbooksSection({ items = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#3b82f6" }}>
        <BookOpen size={20} /> E-books &amp; Research Papers
      </h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th><th>Author</th><th>Type</th><th>Size</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{item.title}</td>
                <td style={{ color: "#94a3b8" }}>{item.author}</td>
                <td><span className="badge badge-outline">{item.type}</span></td>
                <td style={{ color: "#94a3b8" }}>{item.size}</td>
                <td><button className="action-btn"><ExternalLink size={14} /> Open</button></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                  No E-books available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AcademicContent() {
  const [data, setData] = useState({ syllabusItems: [], pyqItems: [], ebookItems: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/academic`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching academic data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "200px", background: "transparent" }}>
        <div className="loading-spinner" />
        <span>Loading Academic Materials…</span>
      </div>
    );
  }

  return (
    <>
      <SyllabusSection items={data.syllabusItems} />
      <PYQSection items={data.pyqItems} />
      <EbooksSection items={data.ebookItems} />
    </>
  );
}
