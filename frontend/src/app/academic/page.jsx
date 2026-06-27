import { BookOpen } from "lucide-react";
import SectionLayout from "../../components/SectionLayout";
import AcademicContent from "../../components/AcademicContent";

export const metadata = {
  title: "Academic Materials | Uni-Hub",
  description: "Access syllabi, past papers, and e-books for all courses.",
};

export default function AcademicPage() {
  return (
    <SectionLayout
      title="Academic Materials"
      description="Access syllabi, past papers, and e-books for all courses."
      icon={<BookOpen size={32} />}
      iconBg="rgba(59,130,246,0.15)"
      iconColor="#3b82f6"
      headerClass="theme-academic-header"
    >
      <AcademicContent />
    </SectionLayout>
  );
}
