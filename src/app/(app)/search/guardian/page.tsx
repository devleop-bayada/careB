import prisma from "@/lib/prisma";
import Link from "next/link";
import { MapPin, ChevronRight, HeartHandshake } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import GuardianSearchFilters from "./GuardianSearchFilters";

async function getGuardians(searchParams: Record<string, string>) {
  const region = searchParams.region;

  const where: any = { user: { isActive: true, isBanned: false } };
  if (region) where.region = { contains: region };

  return prisma.guardianProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
      careRecipients: true,
    },
  });
}

export default async function GuardianSearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const guardians = await getGuardians(searchParams);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-14 z-30">
        <h1 className="text-base font-bold text-gray-900 mb-3">일자리 찾기</h1>
        <GuardianSearchFilters searchParams={searchParams} />
      </div>

      <div className="px-4 py-3">
        <p className="text-sm text-gray-500 mb-3">
          <span className="font-semibold text-gray-900">{guardians.length}건</span>의 구인글이 있어요
        </p>

        {guardians.length === 0 ? (
          <EmptyState
            icon={<HeartHandshake size={40} />}
            title="검색 조건에 맞는 구인글이 없습니다"
            description="지역 필터를 변경하거나 나중에 다시 확인해 보세요"
          />
        ) : (
          <div className="space-y-3">
            {guardians.map((guardian: any) => (
              <Link key={guardian.id} href={`/guardian/${guardian.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar src={guardian.user?.profileImage} name={guardian.user?.name} size="md" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{guardian.user?.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{guardian.region}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <HeartHandshake size={13} className="text-gray-400" />
                      <span className="text-xs text-gray-600">어르신 {guardian.careRecipients?.length || 0}명</span>
                    </div>
                  </div>

                  {guardian.introduction && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 border-t border-gray-50 pt-2">
                      {guardian.introduction}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
