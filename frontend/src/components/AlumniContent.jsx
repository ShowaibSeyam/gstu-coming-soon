"use client";

import { useState, useEffect } from "react";
import { Briefcase, User, MapPin, ExternalLink, GraduationCap, Star, Building } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const avatarColors = [
  { bg: "hsl(200,70%,30%)", color: "hsl(200,90%,80%)" },
  { bg: "hsl(250,70%,30%)", color: "hsl(250,90%,80%)" },
  { bg: "hsl(300,70%,30%)", color: "hsl(300,90%,80%)" },
  { bg: "hsl(350,70%,30%)", color: "hsl(350,90%,80%)" },
  { bg: "hsl(150,70%,30%)", color: "hsl(150,90%,80%)" },
  { bg: "hsl(50,70%,30%)",  color: "hsl(50,90%,80%)" },
];

function getAlumniResourceIcon(iconName) {
  switch (iconName) {
    case "GraduationCap": return <GraduationCap size={20} />;
    case "User": return <User size={20} />;
    case "Star": return <Star size={20} />;
    case "Building": return <Building size={20} />;
    default: return <GraduationCap size={20} />;
  }
}

function AlumniNetwork({ alumni = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#8b5cf6" }}><User size={20} /> Alumni Network</h2>
      <div className="alumni-grid">
        {alumni.map((a, i) => (
          <div key={i} className="alumni-card">
            <div className="alumni-avatar" style={avatarColors[i % avatarColors.length]}>{a.avatar}</div>
            <div className="alumni-info">
              <div className="alumni-name">{a.name}</div>
              <div className="alumni-role">{a.role}</div>
              <div className="alumni-meta">
                <span><Building size={12} /> {a.company}</span>
                <span><MapPin size={12} /> {a.location}</span>
              </div>
              <span className="badge badge-outline">Batch {a.batch}</span>
            </div>
          </div>
        ))}
        {alumni.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", width: "100%", padding: "1.5rem" }}>
            No alumni registered.
          </div>
        )}
      </div>
    </div>
  );
}

function JobsSection({ jobs = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#8b5cf6" }}><Briefcase size={20} /> Jobs &amp; Internships</h2>
      <div className="job-list">
        {jobs.map((j, i) => (
          <div key={i} className="job-card">
            <div className="job-header">
              <div>
                <div className="job-title">{j.title}</div>
                <div className="job-company"><Building size={14} /> {j.company}</div>
              </div>
              <div className="job-right">
                <span className={`badge ${j.type === "Internship" ? "badge-blue" : "badge-purple"}`}>{j.type}</span>
                <button className="action-btn"><ExternalLink size={14} /> Apply</button>
              </div>
            </div>
            <div className="job-meta">
              <span><MapPin size={12} /> {j.location}</span>
              <span>Deadline: {j.deadline}</span>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
            No jobs or internship listings found.
          </div>
        )}
      </div>
    </div>
  );
}

function CareerResourcesSection({ careerResources = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#8b5cf6" }}><GraduationCap size={20} /> Career Resources</h2>
      <div className="card-grid-2">
        {careerResources.map((r, i) => (
          <div key={i} className="mh-card">
            <div className="mh-icon" style={{ background: `${r.color}20`, color: r.color }}>
              {getAlumniResourceIcon(r.iconName)}
            </div>
            <div>
              <h3 className="mh-title">{r.title}</h3>
              <p className="mh-desc">{r.desc}</p>
            </div>
          </div>
        ))}
        {careerResources.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", width: "100%", padding: "1.5rem" }}>
            No career resources listed.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlumniContent() {
  const [data, setData] = useState({ alumni: [], jobs: [], careerResources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/alumni`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching alumni data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "200px", background: "transparent" }}>
        <div className="loading-spinner" />
        <span>Loading Alumni &amp; Career Services…</span>
      </div>
    );
  }

  return (
    <>
      <AlumniNetwork alumni={data.alumni} />
      <JobsSection jobs={data.jobs} />
      <CareerResourcesSection careerResources={data.careerResources} />
    </>
  );
}
