import { Briefcase } from "lucide-react";
import SectionLayout from "../../components/SectionLayout";
import AlumniContent from "../../components/AlumniContent";

export const metadata = {
  title: "Alumni & Career | Uni-Hub",
  description: "Alumni network, jobs & internships, and career resources.",
};

export default function AlumniPage() {
  return (
    <SectionLayout
      title="Alumni & Career"
      description="Alumni network, jobs & internships, and career resources."
      icon={<Briefcase size={32} />}
      iconBg="rgba(139,92,246,0.15)"
      iconColor="#8b5cf6"
      headerClass="theme-alumni-header"
    >
      <AlumniContent />
    </SectionLayout>
  );
}
