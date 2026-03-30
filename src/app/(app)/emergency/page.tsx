"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/layout/BackHeader";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface CareRecipient {
  id: string;
  name: string;
  birthYear: number;
}

const HOUR_OPTIONS = [
  { value: "2", label: "2시간" },
  { value: "4", label: "4시간" },
  { value: "8", label: "8시간" },
  { value: "24", label: "종일" },
];

const CARE_TYPES = [
  { value: "HOME_CARE", label: "방문요양" },
  { value: "HOSPITAL_CARE", label: "병원동행" },
  { value: "DAILY_CARE", label: "간병" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function EmergencyPage() {
  const router = useRouter();
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [dateMode, setDateMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState(todayStr());
  const [hours, setHours] = useState("4");
  const [careType, setCareType] = useState("HOME_CARE");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/care-recipients")
      .then((r) => r.json())
      .then((data) => {
        setCareRecipients(data.careRecipients ?? []);
        if (data.careRecipients?.length > 0) {
          setSelectedRecipientId(data.careRecipients[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function getDate() {
    if (dateMode === "today") return todayStr();
    if (dateMode === "tomorrow") return tomorrowStr();
    return customDate;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/emergency-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careRecipientId: selectedRecipientId || undefined,
          date: getDate(),
          hours,
          careType,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      const data = await res.json();
      router.push(`/emergency/waiting?id=${data.emergencyCareId}&count=${data.sentCount}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="긴급 돌봄 요청" fallbackHref="/home" />

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
        {/* 긴급 안내 배너 */}
        <div className="bg-red-500 rounded-2xl p-4 flex items-start gap-3 text-white">
          <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base">긴급 돌봄 요청</p>
            <p className="text-sm mt-1 opacity-90">
              가까운 가용 요양보호사에게 즉시 요청을 전송합니다. 30분 내 응답이 없으면 자동 만료됩니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 돌봄 대상자 */}
          {careRecipients.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">돌봄 대상자</h2>
              <div className="space-y-2">
                {careRecipients.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="recipient"
                      value={r.id}
                      checked={selectedRecipientId === r.id}
                      onChange={() => setSelectedRecipientId(r.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-800">
                      {r.name} ({r.birthYear}년생)
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 필요 날짜 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">필요 날짜</h2>
            <div className="flex gap-2 mb-3">
              {(["today", "tomorrow", "custom"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDateMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${
                    dateMode === m
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {m === "today" ? "오늘" : m === "tomorrow" ? "내일" : "날짜 선택"}
                </button>
              ))}
            </div>
            {dateMode === "custom" && (
              <input
                type="date"
                value={customDate}
                min={todayStr()}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>

          {/* 돌봄 시간 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">돌봄 시간</h2>
            <div className="grid grid-cols-4 gap-2">
              {HOUR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHours(opt.value)}
                  className={`py-2 rounded-xl text-sm border transition-colors ${
                    hours === opt.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 돌봄 유형 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">돌봄 유형</h2>
            <div className="grid grid-cols-3 gap-2">
              {CARE_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCareType(ct.value)}
                  className={`py-2 rounded-xl text-sm border transition-colors ${
                    careType === ct.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* 특이사항 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">특이사항 (선택)</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="요양보호사에게 전달할 특이사항을 입력해주세요."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              maxLength={300}
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full bg-red-500 hover:bg-red-600 text-white">
            {submitting ? "요청 발송 중..." : "긴급 요청 발송"}
          </Button>
        </form>
      </div>
    </div>
  );
}
