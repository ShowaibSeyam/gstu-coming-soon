"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import TeacherDashboard from "../../../components/dashboard/TeacherDashboard";

export default function TeacherDashboardPage() {
  const { user, loading, isTeacher, isSuperAdmin, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (isSuperAdmin) { router.replace("/dashboard/superadmin"); return; }
    if (isStudent) { router.replace("/dashboard/student"); return; }
  }, [user, loading, isSuperAdmin, isStudent, router]);

  if (loading || !user || isSuperAdmin || isStudent) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  return <TeacherDashboard />;
}
