import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle, MessageSquare, Heart } from "lucide-react";
import CaregiverTabs from "./CaregiverTabs";
import BookmarkButton from "./BookmarkButton";
import GradeBadge from "@/components/caregiver/GradeBadge";
import BackHeader from "@/components/layout/BackHeader";

async function getCaregiver(id: string) {
  return prisma.caregiverProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, profileImage: true, createdAt: true } },
      certificates: true,
      availabilities: true,
      reviewsReceived: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { include: { user: { select: { name: true, profileImage: true } } } },
        },
      },
    },
  });
}

export default async function CaregiverDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const isGuardian = currentUser?.role === "GUARDIAN";

  const caregiver = await getCaregiver(params.id);
  if (!caregiver) notFound();

  const cats: string[] = (() => {
    try { return JSON.parse(caregiver.serviceCategories); } catch { return []; }
  })();

  const CARE_LABELS: Record<string, string> = {
    HOME_CARE: "방문요양", BATH_CARE: "방문목욕",
    NURSING: "방문간호", COGNITIVE: "인지활동", HOUSEKEEPING: "가사지원",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <BackHeader title="요양보호사 프로필" fallbackHref="/search/caregiver" />

      {/* Profile Header */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {caregiver.user?.profileImage ? (
              <img src={caregiver.user.profileImage} alt={caregiver.user.name || ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary-500">{caregiver.user?.name?.[0]}</span>
            )}
          </div>
          <div className="flex-1 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-gray-900">{caregiver.user?.name}</h1>
                <GradeBadge points={(caregiver as any).gradePoints} />
              </div>
              {isGuardian && <BookmarkButton caregiverId={params.id} />}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={13} className="text-gray-400" />
              <span className="text-sm text-gray-500">{caregiver.region}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900">
                  {caregiver.averageRating > 0 ? caregiver.averageRating.toFixed(1) : "신규"}
                </span>
                <span className="text-xs text-gray-400">({caregiver.totalReviews})</span>
              </div>
              <span className="text-xs text-gray-400">경력 {caregiver.experienceYears}년</span>
            </div>
          </div>
        </div>

        {/* Verified Certificates */}
        {caregiver.certificates.filter((c) => c.verificationStatus === "VERIFIED").length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {caregiver.certificates
              .filter((c) => c.verificationStatus === "VERIFIED")
              .map((cert) => (
                <div key={cert.id} className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} className="text-green-500" />
                  <span className="text-xs text-green-700 font-medium">{cert.name}</span>
                </div>
              ))}
          </div>
        )}

        {/* Care Types */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {cats.map((type) => (
            <span key={type} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              {CARE_LABELS[type] || type}
            </span>
          ))}
        </div>

        {/* Grade Progress */}
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium">등급</p>
            <GradeBadge points={(caregiver as any).gradePoints} />
          </div>
          <GradeBadge points={(caregiver as any).gradePoints} showProgress className="w-full" />
        </div>

        {/* Hourly Rate */}
        <div className="mt-3 bg-primary-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">희망 시급</p>
          <p className="text-lg font-black text-primary-500 mt-0.5">
            {caregiver.hourlyRate?.toLocaleString()}원<span className="text-sm font-medium text-gray-500">/시간</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-2">
        <CaregiverTabs caregiver={caregiver} />
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-40">
        <div className="flex gap-2">
          <Link
            href={`/matching?caregiverId=${params.id}`}
            className="flex items-center justify-center gap-2 flex-1 py-3 border-2 border-primary-500 text-primary-500 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors"
          >
            <MessageSquare size={16} />
            메시지
          </Link>
          {isGuardian ? (
            <Link
              href={`/matching/new?caregiverId=${params.id}`}
              className="flex-[2] py-3 bg-primary-500 text-white font-bold rounded-xl text-sm text-center hover:bg-primary-600 transition-colors"
            >
              면접 제안하기
            </Link>
          ) : (
            <Link
              href={`/matching`}
              className="flex-[2] py-3 bg-primary-500 text-white font-bold rounded-xl text-sm text-center hover:bg-primary-600 transition-colors"
            >
              지원하기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
