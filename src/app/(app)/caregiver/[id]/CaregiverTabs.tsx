"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const TABS = ["소개", "리뷰", "일정"];

const DAY_LABELS: Record<string, string> = {
  MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토", SUN: "일",
};

export default function CaregiverTabs({ caregiver }: { caregiver: any }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white">
      <div className="flex border-b border-gray-100">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === i ? "text-primary-500 border-b-2 border-primary-500" : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 py-5">
        {/* 소개 */}
        {activeTab === 0 && (
          <div className="space-y-5">
            {caregiver.introduction ? (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">자기소개</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{caregiver.introduction}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">아직 자기소개가 없어요</p>
            )}
            {caregiver.experience && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">경력사항</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{caregiver.experience}</p>
              </div>
            )}
            {caregiver.education && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">학력</h3>
                <p className="text-sm text-gray-600">{caregiver.education}</p>
              </div>
            )}
          </div>
        )}

        {/* 리뷰 */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {caregiver.reviewsReceived?.length > 0 ? (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">
                      {caregiver.averageRating > 0 ? caregiver.averageRating.toFixed(1) : "-"}
                    </p>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= Math.round(caregiver.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">리뷰 {caregiver.totalReviews}개</p>
                  </div>
                </div>
                {caregiver.reviewsReceived.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {review.author?.user?.profileImage ? (
                          <img src={review.author.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">{review.author?.user?.name?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{review.author?.user?.name}</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} className={s <= review.overallRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.content}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-10">
                <Star size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">아직 리뷰가 없어요</p>
              </div>
            )}
          </div>
        )}

        {/* 일정 */}
        {activeTab === 2 && (
          <div className="space-y-3">
            {caregiver.availabilities?.length > 0 ? (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">가능 일정</h3>
                <div className="space-y-2">
                  {caregiver.availabilities.filter((a: any) => a.isActive).map((avail: any) => (
                    <div key={avail.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">{DAY_LABELS[avail.dayOfWeek] || avail.dayOfWeek}요일</span>
                      <span className="text-sm text-gray-600">{avail.startTime} ~ {avail.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">가능 일정을 확인하려면 메시지를 보내보세요</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
