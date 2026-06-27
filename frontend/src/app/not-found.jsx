import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "404 – Page Not Found | Uni-Hub",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem",
      gap: "1.5rem",
    }}>
      <GraduationCap size={56} color="#60a5fa" />
      <div style={{
        fontSize: "7rem",
        fontWeight: 900,
        lineHeight: 1,
        background: "linear-gradient(to right, #60a5fa, #c084fc)",
        WebkitBackgroundClip: "text",
        color: "transparent",
        letterSpacing: "-0.05em",
      }}>
        404
      </div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Page Not Found</h1>
      <p style={{ color: "#94a3b8", maxWidth: 400, margin: 0 }}>
        The page you are looking for does not exist or has been moved. Head back to the dashboard.
      </p>
      <Link href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "white",
        color: "#0f172a",
        padding: "0.75rem 2rem",
        borderRadius: "9999px",
        fontWeight: 700,
        fontSize: "0.95rem",
        textDecoration: "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}
