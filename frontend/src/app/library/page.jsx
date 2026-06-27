import { Library } from "lucide-react";
import SectionLayout from "../../components/SectionLayout";
import LibraryContent from "../../components/LibraryContent";

export const metadata = {
  title: "Library Access | Uni-Hub",
  description: "Digital library, book search, and journal access.",
};

export default function LibraryPage() {
  return (
    <SectionLayout
      title="Library Access"
      description="Digital library, book search, and journal access."
      icon={<Library size={32} />}
      iconBg="rgba(239,68,68,0.15)"
      iconColor="#ef4444"
      headerClass="theme-library-header"
    >
      <LibraryContent />
    </SectionLayout>
  );
}
