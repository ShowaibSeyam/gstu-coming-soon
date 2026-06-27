import { Heart } from "lucide-react";
import SectionLayout from "../../components/SectionLayout";
import SupportContent from "../../components/SupportContent";

export const metadata = {
  title: "Support Services | Uni-Hub",
  description: "IT Help Desk, Scholarships, and Mental Health resources.",
};

export default function SupportPage() {
  return (
    <SectionLayout
      title="Support Services"
      description="IT Help Desk, Scholarships, and Mental Health resources."
      icon={<Heart size={32} />}
      iconBg="rgba(16,185,129,0.15)"
      iconColor="#10b981"
      headerClass="theme-support-header"
    >
      <SupportContent />
    </SectionLayout>
  );
}
