"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import StudentDashboard from "../../../components/dashboard/StudentDashboard";

export default function StudentDashboardPage() {
  const { user, loading, isStudent, isSuperAdmin, isTeacher } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    // Redirect to correct dashboard if wrong role
    if (isSuperAdmin) { router.replace("/dashboard/superadmin"); return; }
    if (isTeacher) { router.replace("/dashboard/teacher"); return; }
  }, [user, loading, isSuperAdmin, isTeacher, router]);

  if (loading || !user || isSuperAdmin || isTeacher) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  return <StudentDashboard />;
}
