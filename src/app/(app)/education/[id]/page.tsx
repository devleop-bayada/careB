import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Clock, Users, BookOpen } from "lucide-react";
import EducationActions from "./EducationActions";

const CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "필수 교육",
  ADVANCED: "전문 심화",
  PRACTICAL: "실무",
  EMOTIONAL: "정서/소통",
};

export default async function EducationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const education = await prisma.education.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  if (!education) notFound();

  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  let enrollment = null;
  if (user) {
    enrollment = await prisma.educationEnrollment.findUnique({
      where: { userId_educationId: { userId: user.id, educationId: params.id } },
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={education.isRequired ? "danger" : "primary"} size="sm">
            {education.isRequired ? "필수이수" : CATEGORY_LABELS[education.category] || education.category}
          </Badge>
        </div>
        <h1 className="text-white text-xl font-black leading-tight">{education.title}</h1>
        <p className="text-primary-100 text-sm mt-2 leading-relaxed">{education.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-primary-200" />
            <span className="text-primary-100 text-xs">{education.duration}분</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-primary-200" />
            <span className="text-primary-100 text-xs">{education._count.enrollments}명 수강</span>
          </div>
        </div>
      </div>

      {/* Progress (수강 중인 경우) */}
      {enrollment && (
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">학습 진도</span>
            <span className="text-sm font-bold text-primary-500">{enrollment.progress}%</span>
          </div>
          <ProgressBar value={enrollment.progress} size="md" />
          {enrollment.isCompleted && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-green-600">수료 완료</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-5 flex-1">
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: education.content }}
        />
      </div>

      {/* Action Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
        <EducationActions
          educationId={education.id}
          enrollment={enrollment ? {
            id: enrollment.id,
            progress: enrollment.progress,
            isCompleted: enrollment.isCompleted,
          } : null}
        />
      </div>
    </div>
  );
}
