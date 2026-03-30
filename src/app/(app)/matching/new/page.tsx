"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Users, Plus } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";

const SERVICE_CATEGORY_OPTIONS = [
  { value: "HOME_CARE", label: "방문요양" },
  { value: "HOME_BATH", label: "방문목욕" },
  { value: "HOME_NURSING", label: "방문간호" },
  { value: "DAY_NIGHT_CARE", label: "주야간보호" },
  { value: "SHORT_TERM_CARE", label: "단기보호" },
  { value: "HOURLY_CARE", label: "시간제돌봄" },
  { value: "HOSPITAL_CARE", label: "병원간병" },
  { value: "DEMENTIA_CARE", label: "치매전문" },
  { value: "HOSPICE_CARE", label: "임종돌봄" },
];

const DAY_OPTIONS = [
  { value: "MON", label: "월" },
  { value: "TUE", label: "화" },
  { value: "WED", label: "수" },
  { value: "THU", label: "목" },
  { value: "FRI", label: "금" },
  { value: "SAT", label: "토" },
  { value: "SUN", label: "일" },
];

interface CaregiverInfo {
  id: string;
  hourlyRate: number;
  averageRating: number;
  totalReviews: number;
  experienceYears: number;
  region: string;
  user: { name: string; profileImage: string | null };
  serviceCategories: string;
}

interface GuardianInfo {
  id: string;
  region: string;
  user: { name: string; profileImage: string | null };
}

interface CareRecipient {
  id: string;
  name: string;
  gender: string;
  birthYear: number;
  careLevel: string | null;
}

export default function NewMatchingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get("caregiverId") ?? "";
  const guardianId = searchParams.get("guardianId") ?? "";
  // guardianId가 있으면 요양보호사가 보호자에게 지원하는 플로우
  const isApplyFlow = !!guardianId && !caregiverId;

  const [caregiver, setCaregiver] = useState<CaregiverInfo | null>(null);
  const [guardian, setGuardian] = useState<GuardianInfo | null>(null);
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [loadingCaregiver, setLoadingCaregiver] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [serviceCategory, setServiceCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [estimatedRate, setEstimatedRate] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);

  // 요양보호사 정보 조회 (보호자가 요양보호사를 선택한 플로우)
  useEffect(() => {
    if (isApplyFlow) {
      // 요양보호사가 보호자에게 지원하는 플로우: 보호자 정보 조회
      fetch(`/api/guardians/${guardianId}`)
        .then((res) => res.json())
        .then((data) => setGuardian(data.guardian ?? null))
        .catch(() => setGuardian(null))
        .finally(() => setLoadingCaregiver(false));
      return;
    }
    if (!caregiverId) {
      setLoadingCaregiver(false);
      return;
    }
    fetch(`/api/caregivers/${caregiverId}`)
      .then((res) => res.json())
      .then((data) => {
        setCaregiver(data.caregiver ?? null);
        if (data.caregiver?.hourlyRate) {
          setEstimatedRate(String(data.caregiver.hourlyRate));
        }
      })
      .catch(() => setCaregiver(null))
      .finally(() => setLoadingCaregiver(false));
  }, [caregiverId, guardianId, isApplyFlow]);

  // 돌봄 대상자 목록 조회
  useEffect(() => {
    fetch("/api/care-recipients")
      .then((res) => res.json())
      .then((data) => setCareRecipients(data.careRecipients ?? []))
      .catch(() => setCareRecipients([]))
      .finally(() => setLoadingRecipients(false));
  }, []);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function toggleRecipient(id: string) {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!caregiverId && !guardianId) {
      setError("매칭 대상 정보가 없습니다.");
      return;
    }
    if (!serviceCategory) {
      setError("돌봄 유형을 선택해주세요.");
      return;
    }
    if (!startDate) {
      setError("희망 시작일을 선택해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      setError("돌봄 요일을 하나 이상 선택해주세요.");
      return;
    }

    const schedule = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime,
      endTime,
    }));

    const body = {
      ...(isApplyFlow ? { guardianId } : { caregiverId }),
      serviceCategory,
      startDate,
      endDate: endDate || undefined,
      schedule,
      specialRequests: specialRequests || undefined,
      estimatedRate: estimatedRate ? Number(estimatedRate) : undefined,
      careRecipientIds: selectedRecipientIds,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "요청에 실패했습니다.");
        return;
      }
      router.push(`/matching/${data.match.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const cats: string[] = (() => {
    try {
      return JSON.parse(caregiver?.serviceCategories ?? "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <BackHeader
        title={isApplyFlow ? "돌봄 지원하기" : "면접 제안하기"}
        fallbackHref={
          isApplyFlow
            ? `/guardian/${guardianId}`
            : caregiverId
            ? `/caregiver/${caregiverId}`
            : "/search/caregiver"
        }
      />

      <form onSubmit={handleSubmit}>
        {/* 상대방 정보 카드 */}
        <div className="bg-white px-4 py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-3">{isApplyFlow ? "보호자" : "요양보호사"}</p>
          {loadingCaregiver ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-36" />
              </div>
            </div>
          ) : isApplyFlow ? (
            guardian ? (
              <div className="flex items-center gap-3">
                <Avatar src={guardian.user.profileImage} name={guardian.user.name} size="lg" />
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900">{guardian.user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{guardian.region}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                보호자 정보를 불러올 수 없습니다.
              </div>
            )
          ) : caregiver ? (
            <div className="flex items-center gap-3">
              <Avatar src={caregiver.user.profileImage} name={caregiver.user.name} size="lg" />
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{caregiver.user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {caregiver.region} · 경력 {caregiver.experienceYears}년 · 평점 {caregiver.averageRating > 0 ? caregiver.averageRating.toFixed(1) : "신규"}
                </p>
                {cats.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cats.slice(0, 3).map((c) => SERVICE_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c).join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">희망 시급</p>
                <p className="text-sm font-black text-primary-500">{caregiver.hourlyRate.toLocaleString()}원</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              요양보호사 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-3">

          {/* 돌봄 대상자 선택 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={15} className="text-primary-500" />
              돌봄 대상자 선택
            </h2>
            {loadingRecipients ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : careRecipients.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">등록된 어르신이 없습니다.</p>
                <Link
                  href="/my/care-recipients"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 bg-primary-50 px-4 py-2 rounded-xl"
                >
                  <Plus size={14} />
                  어르신 등록하기
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {careRecipients.map((r) => {
                  const age = new Date().getFullYear() - r.birthYear;
                  const selected = selectedRecipientIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRecipient(r.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-colors ${
                        selected
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.gender === "FEMALE" ? "👵" : "👴"}</span>
                        <span className="text-sm font-medium text-gray-900">{r.name}</span>
                        <span className="text-xs text-gray-500">{age}세</span>
                        {r.careLevel && (
                          <span className="text-xs text-gray-400">· {r.careLevel.replace("LEVEL_", "").replace("COGNITIVE_SUPPORT", "인지지원")}등급</span>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-primary-500 bg-primary-500" : "border-gray-300"
                      }`}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 돌봄 조건 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">돌봄 조건</h2>

            <Select
              label="돌봄 유형"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              options={SERVICE_CATEGORY_OPTIONS}
              placeholder="유형 선택"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">돌봄 요일</label>
              <div className="flex gap-2 flex-wrap">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                      selectedDays.includes(d.value)
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <TimePicker
                  label="시작 시간"
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>
              <div className="flex-1">
                <TimePicker
                  label="종료 시간"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>

            <DatePicker
              label="희망 시작일"
              value={startDate}
              onChange={setStartDate}
            />

            <DatePicker
              label="종료일 (선택)"
              value={endDate}
              onChange={setEndDate}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">희망 시급 (원)</label>
              <input
                type="number"
                value={estimatedRate}
                onChange={(e) => setEstimatedRate(e.target.value)}
                placeholder="예: 18000"
                min={0}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white"
              />
            </div>
          </div>

          {/* 요청 메시지 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Textarea
              label="요청 메시지"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="특이사항, 요청사항 등을 자유롭게 적어주세요."
              rows={4}
              maxLength={500}
              currentLength={specialRequests.length}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-3 z-30">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={submitting || (!caregiverId && !guardianId)}
          >
            {isApplyFlow ? "지원하기" : "면접 제안 보내기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
