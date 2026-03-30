import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BackHeader from "@/components/layout/BackHeader";
import Badge from "@/components/ui/Badge";
import { Star, Award, BookOpen, MessageSquare, Share2, Briefcase, TrendingUp } from "lucide-react";
import PortfolioShareButton from "./PortfolioShareButton";

const GRADE_LABELS: Record<string, string> = {
  NEWBIE: "신입",
  GENERAL: "일반",
  SKILLED: "숙련",
  EXPERT: "전문가",
  MASTER: "마스터",
};

const GRADE_COLORS: Record<string, string> = {
  NEWBIE: "gray",
  GENERAL: "blue",
  SKILLED: "green",
  EXPERT: "primary",
  MASTER: "warning",
};

const EDUCATION_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "필수",
  ADVANCED: "심화",
  PRACTICAL: "실무",
  EMOTIONAL: "정서",
};

async function getPortfolioData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const res = await fetch(`${baseUrl}/api/portfolio`, {
      cache: "no-store",
      headers: { cookie: "" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "CAREGIVER") redirect("/home");

  // 직접 DB 조회 (서버 컴포넌트)
  const prisma = (await import("@/lib/prisma")).default;

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { name: true, profileImage: true } },
      certificates: { where: { verificationStatus: "VERIFIED" } },
    },
  });

  if (!profile) redirect("/home");

  const completedEducations = await prisma.educationEnrollment.findMany({
    where: { userId: user.id, isCompleted: true },
    include: { education: { select: { id: true, title: true, category: true } } },
    orderBy: { completedAt: "desc" },
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentReviews = await prisma.review.findMany({
    where: {
      targetId: profile.id,
      isVisible: true,
      createdAt: { gte: sixMonthsAgo },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, overallRating: true, createdAt: true },
  });

  // 월별 평점 계산
  const monthlyRatings: { month: string; avg: number }[] = [];
  const grouped: Record<string, number[]> = {};
  for (const r of recentReviews) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r.overallRating);
  }
  for (const [month, ratings] of Object.entries(grouped)) {
    monthlyRatings.push({
      month,
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    });
  }

  const recommendations = await prisma.review.findMany({
    where: { targetId: profile.id, isVisible: true, overallRating: { gte: 4 } },
    take: 5,
    orderBy: { overallRating: "desc" },
    select: { id: true, content: true, overallRating: true, createdAt: true },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="내 포트폴리오" fallbackHref="/my" />

      {/* Profile Summary */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pb-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.user.profileImage ? (
              <img src={profile.user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-black">
                {profile.user.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-white text-lg font-black">{profile.user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={(GRADE_COLORS[profile.grade] || "gray") as any} size="sm">
                {GRADE_LABELS[profile.grade] || profile.grade}
              </Badge>
              {profile.region && (
                <span className="text-primary-100 text-xs">{profile.region}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-4 -mt-3 grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <Briefcase size={18} className="text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{profile.experienceYears}년</p>
          <p className="text-[10px] text-gray-500">총 경력</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <Award size={18} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{profile.totalCares}건</p>
          <p className="text-[10px] text-gray-500">돌봄 건수</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <Star size={18} className="text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{profile.averageRating?.toFixed(1) || "-"}</p>
          <p className="text-[10px] text-gray-500">평균 평점</p>
        </div>
      </div>

      {/* Rating Trend */}
      {monthlyRatings.length > 0 && (
        <section className="mx-4 mt-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <TrendingUp size={16} className="text-primary-500" />
            평점 추이 (최근 6개월)
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-end gap-2 h-24">
              {monthlyRatings.map((mr) => {
                const height = (mr.avg / 5) * 100;
                return (
                  <div key={mr.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-primary-500">{mr.avg}</span>
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "80px" }}>
                      <div
                        className="absolute bottom-0 w-full bg-primary-400 rounded-t-lg transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400">{mr.month.split("-")[1]}월</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Completed Educations */}
      {completedEducations.length > 0 && (
        <section className="mx-4 mt-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <BookOpen size={16} className="text-green-500" />
            수료한 교육
          </h3>
          <div className="flex flex-wrap gap-2">
            {completedEducations.map((e: any) => (
              <div
                key={e.id}
                className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{e.education.title}</p>
                  <p className="text-[10px] text-gray-400">
                    {EDUCATION_CATEGORY_LABELS[e.education.category] || e.education.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mx-4 mt-5 mb-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <MessageSquare size={16} className="text-blue-500" />
            보호자 추천사
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: rec.overallRating }).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  &quot;{rec.content}&quot;
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(rec.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Share Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
        <PortfolioShareButton />
      </div>
    </div>
  );
}
