"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Star, MapPin } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

interface BookmarkedCaregiver {
  id: string;
  name: string;
  profileImage?: string;
  region?: string;
  hourlyRate?: number;
  averageRating?: number;
  totalReviews?: number;
}

export default function BookmarksPage() {
  const [caregivers, setCaregivers] = useState<BookmarkedCaregiver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => {
        setCaregivers(data.bookmarks || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeBookmark(caregiverId: string) {
    await fetch(`/api/bookmarks?caregiverId=${caregiverId}`, { method: "DELETE" });
    setCaregivers((prev) => prev.filter((c) => c.id !== caregiverId));
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="즐겨찾기" fallbackHref="/my" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : caregivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">즐겨찾기한 요양보호사가 없어요</p>
          <p className="text-sm text-gray-400 mt-1">마음에 드는 요양보호사를 저장해보세요</p>
          <Link
            href="/search/caregiver"
            className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
          >
            요양보호사 찾기
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {caregivers.map((caregiver) => (
            <div key={caregiver.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <Link href={`/caregiver/${caregiver.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {caregiver.profileImage ? (
                      <img src={caregiver.profileImage} alt={caregiver.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary-500">{caregiver.name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{caregiver.name}</p>
                    {caregiver.region && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{caregiver.region}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {caregiver.averageRating !== undefined && caregiver.averageRating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">{caregiver.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({caregiver.totalReviews})</span>
                        </div>
                      )}
                      {caregiver.hourlyRate && (
                        <span className="text-xs font-semibold text-primary-500">
                          {caregiver.hourlyRate.toLocaleString()}원/시간
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeBookmark(caregiver.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <Heart size={18} className="text-red-500 fill-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
