import Link from "next/link";
import { BookOpen, Clock, Users, CheckCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import EducationCategoryTabs from "./EducationCategoryTabs";

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  REQUIRED: "필수 교육",
  ADVANCED: "전문 심화",
  PRACTICAL: "실무",
  EMOTIONAL: "정서/소통",
};

async function getEducations(category: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const params = category && category !== "ALL" ? `?category=${category}` : "";
    const res = await fetch(`${baseUrl}/api/education${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.educations || [];
  } catch {
    return [];
  }
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const category = searchParams.category || "ALL";
  const educations = await getEducations(category);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-0 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">교육 콘텐츠</h1>
        <EducationCategoryTabs activeCategory={category} />
      </div>

      {/* Education List */}
      <div className="px-4 py-3 space-y-3">
        {educations.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={40} />}
            title="아직 교육 콘텐츠가 없어요"
            description="곧 다양한 교육이 준비됩니다!"
          />
        ) : (
          educations.map((edu: any) => (
            <Link key={edu.id} href={`/education/${edu.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={edu.isRequired ? "danger" : "primary"} size="sm">
                    {edu.isRequired ? "필수" : CATEGORY_LABELS[edu.category] || edu.category}
                  </Badge>
                  {edu.isRequired && (
                    <Badge variant="red" size="sm">필수이수</Badge>
                  )}
                </div>
                <h2 className="text-sm font-bold text-gray-900 line-clamp-2">{edu.title}</h2>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {edu.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{edu.duration}분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{edu._count?.enrollments || 0}명 수강</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
