import { Landmark } from "lucide-react";
import SectionLayout from "../../components/SectionLayout";
import AdminContent from "../../components/AdminContent";

export const metadata = {
  title: "Admin Information | Uni-Hub",
  description: "Course registration, fees, calendar and official notices.",
};

export default function AdminPage() {
  return (
    <SectionLayout
      title="Admin Information"
      description="Course registration, fees, calendar and official notices."
      icon={<Landmark size={32} />}
      iconBg="rgba(217,119,6,0.15)"
      iconColor="#d97706"
      headerClass="theme-admin-header"
    >
      <AdminContent />
    </SectionLayout>
  );
}
