"use client";

import Link from "next/link";
import { Heart, Star, MapPin } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import EmptyState from "@/components/ui/EmptyState";
import BackHeader from "@/components/layout/BackHeader";
import { useBookmarks, useToggleBookmark } from "@/hooks/useBookmarks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BookmarkedCaregiver {
  id: string;
  caregiverId: string;
  caregiver: {
    id: string;
    hourlyRate?: number;
    averageRating?: number;
    totalReviews?: number;
    region?: string;
    user: {
      id: string;
      name: string;
      profileImage?: string;
    };
  };
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  if (user !== undefined && user?.role !== "GUARDIAN") { router.push("/home"); return null; }
  const { bookmarks, isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  function removeBookmark(bookmark: BookmarkedCaregiver) {
    toggleBookmark.mutate({
      caregiverId: bookmark.caregiver.id,
      action: "remove",
      bookmarkId: bookmark.id,
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="즐겨찾기" fallbackHref="/my" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title="즐겨찾기한 요양보호사가 없어요"
          description="마음에 드는 요양보호사를 저장해보세요"
          action={
            <Link
              href="/search/caregiver"
              className="mt-2 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              요양보호사 찾기
            </Link>
          }
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {bookmarks.map((bookmark: BookmarkedCaregiver) => {
            const caregiver = bookmark.caregiver;
            const user = caregiver?.user;
            return (
              <div key={bookmark.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <Link href={`/caregiver/${caregiver.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar src={user?.profileImage} name={user?.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      {caregiver.region && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{caregiver.region}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {caregiver.averageRating !== undefined && caregiver.averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarRating value={Math.round(caregiver.averageRating)} readonly size="sm" />
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
                    onClick={() => removeBookmark(bookmark)}
                    disabled={toggleBookmark.isPending}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Heart size={18} className="text-red-500 fill-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
