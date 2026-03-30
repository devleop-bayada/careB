"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, MapPin, CheckCircle2, CalendarClock, AlertCircle,
  Utensils, Heart, Pill, ChevronRight, User
} from "lucide-react";

interface LatestJournal {
  id: string;
  title: string;
  activities: string[];
  mood: string;
  meals?: string | null;
  medicationTaken?: boolean;
  content?: string;
  createdAt: string;
}

interface ActiveSession {
  id: string;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  checkInTime?: string | null;
  checkInAddress?: string | null;
  checkOutTime?: string | null;
  caregiver?: {
    id: string;
    user?: { name: string; profileImage?: string | null } | null;
  } | null;
  latestJournal?: LatestJournal | null;
}

const MOOD_MAP: Record<string, { label: string; emoji: string }> = {
  great: { label: "최고", emoji: "😄" },
  good: { label: "좋음", emoji: "🙂" },
  normal: { label: "보통", emoji: "😐" },
  bad: { label: "힘듦", emoji: "😔" },
};

const ACTIVITY_MAP: Record<string, string> = {
  meal: "식사",
  exercise: "운동/산책",
  medication: "투약",
  outdoor: "외출",
  cognitive: "인지활동",
  bath: "목욕",
};

function formatElapsed(checkInTime: string): string {
  const diff = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function CareStatusWidget() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await fetch("/api/care-sessions?status=IN_PROGRESS");
        if (!res.ok) return;
        const data = await res.json();
        const sessions: ActiveSession[] = data.sessions ?? [];
        // IN_PROGRESS 우선, 없으면 SCHEDULED 중 가장 가까운 것
        const active =
          sessions.find((s) => s.status === "IN_PROGRESS") ??
          sessions.find((s) => s.status === "SCHEDULED") ??
          null;
        setSession(active);
      } finally {
        setLoading(false);
      }
    }
    fetchActive();
  }, []);

  // 실시간 경과 시간 업데이트
  useEffect(() => {
    if (!session?.checkInTime) return;
    const update = () => setElapsed(formatElapsed(session.checkInTime!));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [session?.checkInTime]);

  if (loading) {
    return (
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-8 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <CalendarClock size={20} className="text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">예정된 돌봄 없음</p>
          <p className="text-xs text-gray-400 mt-0.5">현재 진행 중인 돌봄이 없습니다</p>
        </div>
      </div>
    );
  }

  const isInProgress = session.status === "IN_PROGRESS";
  const isCompleted = session.status === "COMPLETED";
  const caregiverName = session.caregiver?.user?.name ?? "요양보호사";
  const journal = session.latestJournal;

  let activities: string[] = [];
  if (journal?.activities) {
    try {
      activities = typeof journal.activities === "string"
        ? JSON.parse(journal.activities)
        : journal.activities;
    } catch {
      activities = [];
    }
  }

  return (
    <div
      className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/care/${session.id}`)}
    >
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isInProgress ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              돌봄 중
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              오늘 돌봄 완료
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              <CalendarClock size={12} />
              돌봄 예정
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </div>

      {/* 요양보호사 정보 */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {session.caregiver?.user?.profileImage ? (
            <img src={session.caregiver.user.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-primary-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{caregiverName}</p>
          <p className="text-xs text-gray-500">
            {session.startTime} ~ {session.endTime}
          </p>
        </div>
        {isInProgress && elapsed && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">경과 시간</p>
            <p className="text-sm font-black text-primary-500">{elapsed}</p>
          </div>
        )}
      </div>

      {/* GPS 체크인 정보 */}
      {session.checkInTime && (
        <div className="mx-4 mb-3 bg-green-50 rounded-xl px-3 py-2 flex items-start gap-2">
          <MapPin size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-700">
              출근 {formatTime(session.checkInTime)}
            </p>
            {session.checkInAddress && (
              <p className="text-xs text-green-600 mt-0.5 truncate">{session.checkInAddress}</p>
            )}
          </div>
          {session.checkOutTime && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500">
                퇴근 {formatTime(session.checkOutTime)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 최근 일지 요약 */}
      {journal ? (
        <div className="mx-4 mb-4 border-t border-gray-50 pt-3">
          <p className="text-xs font-bold text-gray-500 mb-2">최근 일지</p>
          <p className="text-xs font-semibold text-gray-800 mb-1.5">{journal.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {activities.slice(0, 4).map((act) => (
              <span key={act} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md font-medium">
                {ACTIVITY_MAP[act] ?? act}
              </span>
            ))}
            {journal.mood && (
              <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-md font-medium">
                {MOOD_MAP[journal.mood]?.emoji} {MOOD_MAP[journal.mood]?.label}
              </span>
            )}
            {journal.medicationTaken && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                <Pill size={10} />
                투약완료
              </span>
            )}
          </div>
          {journal.meals && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Utensils size={11} className="text-gray-400" />
              <p className="text-xs text-gray-500 truncate">{journal.meals}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-4 mb-4 border-t border-gray-50 pt-3">
          <p className="text-xs text-gray-400 text-center py-1">아직 작성된 일지가 없습니다</p>
        </div>
      )}
    </div>
  );
}
