'use client';

import Button from '@/components/ui/Button';
import Rating from '@/components/ui/Rating';
import Textarea from '@/components/ui/Textarea';
import { useState } from 'react';

interface SubRating {
  key: string;
  label: string;
}

const SUB_RATINGS: SubRating[] = [
  { key: 'punctuality', label: '시간약속' },
  { key: 'attitude', label: '태도' },
  { key: 'expertise', label: '전문성' },
  { key: 'communication', label: '소통' },
  { key: 'healthCareSkill', label: '건강관리 능력' },
];

interface ReviewFormProps {
  onSubmit?: (data: {
    overallRating: number;
    subRatings: Record<string, number>;
    content: string;
  }) => void | Promise<void>;
  loading?: boolean;
}

export default function ReviewForm({ onSubmit, loading = false }: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>(
    Object.fromEntries(SUB_RATINGS.map((s) => [s.key, 0])),
  );
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overallRating === 0) { setError('별점을 선택해 주세요.'); return; }
    if (content.trim().length < 10) { setError('후기를 10자 이상 작성해 주세요.'); return; }
    setError('');
    await onSubmit?.({ overallRating, subRatings, content });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Overall rating */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">전체 평점</p>
        <Rating value={overallRating} interactive onChange={setOverallRating} size="lg" />
      </div>

      {/* Sub ratings */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-800">세부 평가</p>
        {SUB_RATINGS.map((sub) => (
          <div key={sub.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{sub.label}</span>
            <Rating
              value={subRatings[sub.key]}
              interactive
              onChange={(v) => setSubRatings((prev) => ({ ...prev, [sub.key]: v }))}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <Textarea
        label="후기 내용"
        placeholder="요양보호사와의 경험을 자세히 작성해 주세요. (최소 10자)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        maxLength={500}
        currentLength={content.length}
        error={error}
      />

      <Button type="submit" fullWidth loading={loading} disabled={overallRating === 0}>
        후기 등록
      </Button>
    </form>
  );
}
