"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/layout/BackHeader";
import Button from "@/components/ui/Button";
import StarRating from "@/components/review/StarRating";
import Avatar from "@/components/ui/Avatar";

const TAGS = [
  "치매케어 전문가",
  "정성스러운 케어",
  "소통 잘됨",
  "위생관리 철저",
  "가족처럼 돌봐줌",
  "재이용 의향",
];

interface CaregiverInfo {
  id: string;
  user: { name: string; profileImage: string | null };
}

export default function WriteReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careSessionId = searchParams.get("careSessionId") ?? "";
  const caregiverId = searchParams.get("caregiverId") ?? "";

  const [caregiver, setCaregiver] = useState<CaregiverInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [kindnessRating, setKindnessRating] = useState(0);
  const [trustRating, setTrustRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!caregiverId) { setLoading(false); return; }
    fetch(`/api/caregivers/${caregiverId}`)
      .then((r) => r.json())
      .then((data) => setCaregiver(data.caregiver ?? null))
      .catch(() => setCaregiver(null))
      .finally(() => setLoading(false));
  }, [caregiverId]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function calcOverall() {
    const vals = [
      professionalismRating,
      kindnessRating,
      trustRating,
      punctualityRating,
      communicationRating,
    ].filter((v) => v > 0);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.length < 20) { setError("리뷰는 20자 이상 작성해주세요."); return; }
    if (content.length > 500) { setError("리뷰는 500자 이하로 작성해주세요."); return; }
    const overall = calcOverall();
    if (overall === 0) { setError("하나 이상의 항목 평점을 선택해주세요."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careSessionId,
          overallRating: overall,
          professionalism: professionalismRating || undefined,
          kindness: kindnessRating || undefined,
          trust: trustRating || undefined,
          punctuality: punctualityRating || undefined,
          communication: communicationRating || undefined,
          tags: selectedTags,
          content,
          images: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      router.push("/my/reviews");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="리뷰 작성" fallbackHref="/my/reviews" />

      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
        ) : caregiver ? (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <Avatar src={caregiver.user.profileImage} name={caregiver.user.name} size="lg" />
            <div>
              <p className="text-xs text-gray-500">요양보호사</p>
              <p className="text-base font-semibold text-gray-900">{caregiver.user.name}</p>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">항목별 평점</h2>
          <StarRating value={professionalismRating} onChange={setProfessionalismRating} label="전문성" />
          <StarRating value={kindnessRating} onChange={setKindnessRating} label="친절함" />
          <StarRating value={trustRating} onChange={setTrustRating} label="신뢰도" />
          <StarRating value={punctualityRating} onChange={setPunctualityRating} label="시간준수" />
          <StarRating value={communicationRating} onChange={setCommunicationRating} label="의사소통" />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">태그 선택 (복수 선택 가능)</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">리뷰 작성</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="돌봄 서비스 경험을 자세히 공유해주세요. (20~500자)"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={5}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{content.length}/500</p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "제출 중..." : "리뷰 등록"}
        </Button>
      </form>
    </div>
  );
}
