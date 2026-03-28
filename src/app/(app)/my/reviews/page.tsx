import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Star } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

async function getReviews(userId: string, role: string) {
  if (role === "CAREGIVER") {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return [];
    return prisma.review.findMany({
      where: { targetId: caregiverProfile.id, isVisible: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: { include: { user: { select: { name: true, profileImage: true } } } },
      },
    });
  } else {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return [];
    return prisma.review.findMany({
      where: { authorId: guardianProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        target: { include: { user: { select: { name: true, profileImage: true } } } },
      },
    });
  }
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  const isCaregiver = user.role === "CAREGIVER";

  const reviews = await getReviews(user.id, user.role);
  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="리뷰 관리" fallbackHref="/my" />

      {reviews.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
          <div className="text-center pr-4 border-r border-gray-100">
            <p className="text-3xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} className={s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">총 {reviews.length}개</p>
            <p className="text-xs text-gray-500 mt-0.5">의 리뷰가 있어요</p>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Star size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">아직 리뷰가 없어요</p>
          </div>
        ) : (
          reviews.map((review: any) => {
            const other = isCaregiver
              ? review.author?.user
              : review.target?.user;
            return (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {other?.profileImage ? (
                      <img src={other.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-500">{other?.name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{other?.name}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} className={s <= review.overallRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
