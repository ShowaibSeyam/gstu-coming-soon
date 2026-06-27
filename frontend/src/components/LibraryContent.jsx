"use client";

import { useState, useEffect } from "react";
import { Globe, Search, BookMarked, Star, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function DigitalLibrarySection({ digitalResources = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#ef4444" }}><Globe size={20} /> Digital Library</h2>
      <div className="card-grid-3">
        {digitalResources.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card">
            <div className="resource-name">{r.name}</div>
            <div className="resource-desc">{r.desc}</div>
            <div className="resource-tags">
              {r.tags.map((t, j) => <span key={j} className="badge badge-outline">{t}</span>)}
            </div>
          </a>
        ))}
        {digitalResources.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", width: "100%", padding: "1.5rem" }}>
            No digital resources available.
          </div>
        )}
      </div>
    </div>
  );
}

function BookSearchSection({ books = [], onReserve }) {
  const [query, setQuery] = useState("");
  const filtered = books.filter(
    (b) => b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#ef4444" }}><Search size={20} /> Book Search</h2>
      <div className="search-input-wrap">
        <Search size={18} style={{ color: "#94a3b8" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author..."
          className="section-search-input"
        />
      </div>
      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Author</th><th>Copies</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{b.title}</td>
                <td style={{ color: "#94a3b8" }}>{b.author}</td>
                <td>{b.copies}</td>
                <td>
                  {b.available
                    ? <span className="badge badge-green">Available</span>
                    : <span className="badge badge-red">Due {b.dueDate}</span>}
                </td>
                <td>
                  <button 
                    className="action-btn" 
                    disabled={!b.available} 
                    onClick={() => onReserve(b.title)}
                    style={{ opacity: b.available ? 1 : 0.4 }}
                  >
                    {b.available ? "Reserve" : "Waitlist"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                  No books matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JournalSection({ journals = [] }) {
  return (
    <div className="content-block">
      <h2 className="block-heading" style={{ color: "#ef4444" }}><BookMarked size={20} /> Journal Access</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Journal</th><th>Publisher</th><th>Impact Factor</th><th>Access</th><th>Action</th></tr>
          </thead>
          <tbody>
            {journals.map((j, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{j.name}</td>
                <td style={{ color: "#94a3b8" }}>{j.publisher}</td>
                <td>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={14} color="#d97706" fill="#d97706" /> {j.impact}
                  </span>
                </td>
                <td><span className={`badge ${j.access === "Full" ? "badge-green" : "badge-amber"}`}>{j.access} Access</span></td>
                <td><button className="action-btn"><Clock size={14} /> Browse</button></td>
              </tr>
            ))}
            {journals.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                  No journals available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LibraryContent() {
  const [data, setData] = useState({ digitalResources: [], books: [], journals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/library`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching library data:", err);
        setLoading(false);
      });
  }, []);

  const handleReserve = (bookTitle) => {
    fetch(`${API_URL}/library/books/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: bookTitle }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Reservation failed");
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          setData((prev) => ({
            ...prev,
            books: prev.books.map((b) =>
              b.title === bookTitle ? { ...b, available: result.book.available, dueDate: result.book.dueDate } : b
            ),
          }));
          alert(`Successfully reserved "${bookTitle}". Due back: ${result.book.dueDate}`);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Could not reserve book.");
      });
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "200px", background: "transparent" }}>
        <div className="loading-spinner" />
        <span>Loading Library Access…</span>
      </div>
    );
  }

  return (
    <>
      <DigitalLibrarySection digitalResources={data.digitalResources} />
      <BookSearchSection books={data.books} onReserve={handleReserve} />
      <JournalSection journals={data.journals} />
    </>
  );
}
