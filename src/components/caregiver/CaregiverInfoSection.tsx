'use client';

import Rating from '@/components/ui/Rating';
import Tabs from '@/components/ui/Tabs';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Review {
  id: string;
  authorName: string;
  authorImage?: string | null;
  rating: number;
  date: string;
  content: string;
}

interface CaregiverInfoSectionProps {
  bio?: string;
  specialties?: string[];
  caregiverType?: string;
  serviceCategories?: string[];
  experience?: string;
  education?: string;
  reviews?: Review[];
  averageRating?: number;
  availableDays?: string[];
  className?: string;
}

const TABS = [
  { key: 'intro', label: '소개' },
  { key: 'review', label: '리뷰' },
  { key: 'schedule', label: '일정' },
];

export default function CaregiverInfoSection({
  bio,
  specialties = [],
  caregiverType,
  serviceCategories = [],
  experience,
  education,
  reviews = [],
  averageRating = 0,
  availableDays = [],
  className,
}: CaregiverInfoSectionProps) {
  const [activeTab, setActiveTab] = useState('intro');

  return (
    <div className={cn('', className)}>
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="px-4 py-4">
        {activeTab === 'intro' && (
          <div className="space-y-4">
            {bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">자기소개</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
              </div>
            )}
            {caregiverType && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">요양보호사 유형</h4>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                  {caregiverType}
                </span>
              </div>
            )}
            {specialties.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">전문 돌봄 분야</h4>
                <div className="flex flex-wrap gap-1.5">
                  {specialties.map((spec) => (
                    <span key={spec} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {serviceCategories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">서비스 분야</h4>
                <div className="flex flex-wrap gap-1.5">
                  {serviceCategories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {experience && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">경력</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{experience}</p>
              </div>
            )}
            {education && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">학력</h4>
                <p className="text-sm text-gray-600">{education}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-4">
            {averageRating > 0 && (
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                <div>
                  <Rating value={averageRating} />
                  <span className="text-sm text-gray-500">{reviews.length}개 리뷰</span>
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">아직 리뷰가 없습니다.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{review.authorName}</span>
                    <Rating value={review.rating} size="sm" />
                    <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">주간 가능 일정</h4>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => {
                const isAvailable = availableDays.includes(day.value);
                return (
                  <div
                    key={day.value}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl',
                      isAvailable ? 'bg-primary-50' : 'bg-gray-50',
                    )}
                  >
                    <span className={cn(
                      'text-xs font-semibold',
                      isAvailable ? 'text-primary-600' : 'text-gray-400',
                    )}>
                      {day.label}
                    </span>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      isAvailable ? 'bg-primary-500' : 'bg-gray-200',
                    )} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
