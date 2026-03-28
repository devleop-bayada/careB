import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, HeartHandshake, MessageSquare } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

async function getGuardian(id: string) {
  return prisma.guardianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, profileImage: true, createdAt: true } },
      careRecipients: true,
    },
  });
}

export default async function GuardianDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const isCaregiver = currentUser?.role === "CAREGIVER";

  const guardian = await getGuardian(params.id);
  if (!guardian) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <BackHeader title="보호자 프로필" fallbackHref="/search/guardian" />

      {/* Profile Card */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {guardian.user?.profileImage ? (
              <img src={guardian.user.profileImage} alt={guardian.user.name || ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-500">{guardian.user?.name?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900">{guardian.user?.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={13} className="text-gray-400" />
              <span className="text-sm text-gray-500">{guardian.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Care Recipients Info */}
      {guardian.careRecipients && guardian.careRecipients.length > 0 && (
        <div className="bg-white mt-2 px-4 py-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <HeartHandshake size={16} className="text-primary-500" />
            어르신 정보
          </h2>
          <div className="space-y-2">
            {guardian.careRecipients.map((recipient: any) => {
              const birthYear = new Date(recipient.birthDate).getFullYear();
              const age = new Date().getFullYear() - birthYear;
              return (
                <div key={recipient.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👴</span>
                    <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{age}세 ({birthYear}년생)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Introduction */}
      {guardian.introduction && (
        <div className="bg-white mt-2 px-4 py-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">소개</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{guardian.introduction}</p>
        </div>
      )}


      {/* Fixed Bottom CTA */}
      {isCaregiver && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
          <div className="flex gap-2">
            <Link
              href={`/matching`}
              className="flex items-center justify-center gap-2 flex-1 py-3 border-2 border-primary-500 text-primary-500 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors"
            >
              <MessageSquare size={16} />
              메시지
            </Link>
            <Link
              href={`/matching/new?guardianId=${params.id}`}
              className="flex-[2] py-3 bg-primary-500 text-white font-bold rounded-xl text-sm text-center hover:bg-primary-600 transition-colors"
            >
              지원하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
