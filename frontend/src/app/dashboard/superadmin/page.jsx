"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import SuperAdminDashboard from "../../../components/dashboard/SuperAdminDashboard";

export default function SuperAdminDashboardPage() {
  const { user, loading, isSuperAdmin, isTeacher, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (isTeacher) { router.replace("/dashboard/teacher"); return; }
    if (isStudent) { router.replace("/dashboard/student"); return; }
  }, [user, loading, isTeacher, isStudent, router]);

  if (loading || !user || isTeacher || isStudent) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  return <SuperAdminDashboard />;
}
