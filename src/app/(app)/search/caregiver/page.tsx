import prisma from "@/lib/prisma";
import Link from "next/link";
import { Star, MapPin, CheckCircle, ChevronRight } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import EmptyState from "@/components/ui/EmptyState";
import CaregiverSearchFilters from "./CaregiverSearchFilters";

async function getCaregivers(searchParams: Record<string, string>) {
  const region = searchParams.region;
  const careType = searchParams.careType;
  const sort = searchParams.sort || "averageRating";

  const where: any = { user: { isActive: true, isBanned: false } };
  if (region) where.region = { contains: region };
  if (careType) where.serviceCategories = { contains: careType };

  const orderBy: any = sort === "updatedAt" ? { updatedAt: "desc" } : { averageRating: "desc" };

  return prisma.caregiverProfile.findMany({
    where,
    orderBy,
    take: 20,
    include: {
      user: { select: { name: true, profileImage: true } },
      certificates: { where: { verificationStatus: "VERIFIED" } },
    },
  });
}

export default async function CaregiverSearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const caregivers = await getCaregivers(searchParams);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">요양보호사 찾기</h1>
        <CaregiverSearchFilters searchParams={searchParams} />
      </div>

      <div className="px-4 py-3">
        <p className="text-sm text-gray-500 mb-3">
          <span className="font-semibold text-gray-900">{caregivers.length}명</span>의 요양보호사를 찾았어요
        </p>

        {caregivers.length === 0 ? (
          <EmptyState
            icon={<Star size={40} />}
            title="검색 조건에 맞는 요양보호사가 없습니다"
            description="필터를 조정해 보세요"
          />
        ) : (
          <div className="space-y-3">
            {caregivers.map((caregiver: any) => {
              const cats: string[] = (() => {
                try { return JSON.parse(caregiver.serviceCategories); } catch { return []; }
              })();
              const CARE_LABELS: Record<string, string> = {
                HOME_CARE: "방문요양", HOME_BATH: "방문목욕",
                HOME_NURSING: "방문간호", DAY_NIGHT_CARE: "주야간보호",
                SHORT_TERM_CARE: "단기보호", HOURLY_CARE: "시간제돌봄",
                HOSPITAL_CARE: "병원간병", DEMENTIA_CARE: "치매전문",
                HOSPICE_CARE: "임종돌봄",
              };
              return (
                <Link key={caregiver.id} href={`/caregiver/${caregiver.id}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <Avatar src={caregiver.user?.profileImage} name={caregiver.user?.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{caregiver.user?.name}</span>
                          <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{caregiver.region}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <StarRating value={Math.round(caregiver.averageRating || 0)} readonly size="sm" />
                            <span className="text-xs font-semibold text-gray-700">
                              {caregiver.averageRating ? caregiver.averageRating.toFixed(1) : "신규"}
                            </span>
                            <span className="text-xs text-gray-400">({caregiver.totalReviews})</span>
                          </div>
                          {caregiver.certificates?.length > 0 && (
                            <Badge variant="success" size="sm">
                              자격증 {caregiver.certificates.length}개
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cats.slice(0, 3).map((type) => (
                            <Tag key={type} color="bg-gray-100 text-gray-600">
                              {CARE_LABELS[type] || type}
                            </Tag>
                          ))}
                        </div>
                        <p className="text-xs font-semibold text-primary-500 mt-2">
                          시급 {caregiver.hourlyRate?.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                    {caregiver.introduction && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 border-t border-gray-50 pt-3">
                        {caregiver.introduction}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
