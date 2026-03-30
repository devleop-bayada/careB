"use client";

import { useState } from "react";
import Link from "next/link";
import BackHeader from "@/components/layout/BackHeader";
import Tabs from "@/components/ui/Tabs";
import {
  ChevronRight, ExternalLink, CheckSquare, Square,
  Calculator, ClipboardList, Info,
  AlertTriangle, CheckCircle2
} from "lucide-react";

// ─── 정적 데이터 (2026년 기준) ────────────────────────────────────────────

const GRADES = [
  {
    grade: "1등급",
    gradeNum: 1,
    scoreRange: "95점 이상",
    monthlyLimit: 1885000,
    description: "심신의 기능상태 장애로 일상생활에서 전적으로 다른 사람의 도움이 필요한 자",
    availableServices: ["방문요양", "방문목욕", "방문간호", "주야간보호", "단기보호", "복지용구"],
    color: "bg-red-500",
    lightColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    grade: "2등급",
    gradeNum: 2,
    scoreRange: "75~94점",
    monthlyLimit: 1690000,
    description: "심신의 기능상태 장애로 일상생활에서 상당 부분 다른 사람의 도움이 필요한 자",
    availableServices: ["방문요양", "방문목욕", "방문간호", "주야간보호", "단기보호", "복지용구"],
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    grade: "3등급",
    gradeNum: 3,
    scoreRange: "60~74점",
    monthlyLimit: 1417200,
    description: "심신의 기능상태 장애로 일상생활에서 부분적으로 다른 사람의 도움이 필요한 자",
    availableServices: ["방문요양", "방문목욕", "방문간호", "주야간보호", "단기보호", "복지용구"],
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-200",
  },
  {
    grade: "4등급",
    gradeNum: 4,
    scoreRange: "51~59점",
    monthlyLimit: 1306200,
    description: "심신의 기능상태 장애로 일상생활에서 일정 부분 다른 사람의 도움이 필요한 자",
    availableServices: ["방문요양", "방문목욕", "방문간호", "주야간보호", "복지용구"],
    color: "bg-green-500",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    grade: "5등급",
    gradeNum: 5,
    scoreRange: "45~50점",
    monthlyLimit: 1121100,
    description: "치매환자 (「노인장기요양보험법 시행령」 제2조에 따른 노인성 질병으로 한정)",
    availableServices: ["방문요양", "방문목욕", "복지용구"],
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    grade: "인지지원등급",
    gradeNum: 6,
    scoreRange: "45점 미만 (치매)",
    monthlyLimit: 624600,
    description: "치매환자로서 장기요양 1~5등급에 해당하지 않는 자",
    availableServices: ["인지활동형 방문요양", "주야간보호", "복지용구"],
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
];

const COPAYMENT_RATES = [
  { label: "일반", value: 0.15, desc: "급여비용의 15%" },
  { label: "의료급여수급자", value: 0, desc: "면제 (0%)" },
  { label: "차상위 감경 (50%)", value: 0.075, desc: "급여비용의 7.5%" },
  { label: "차상위 감경 (60%)", value: 0.06, desc: "급여비용의 6%" },
];

// 방문요양 수가 (분 단위)
const HOME_CARE_RATES: { minutes: number; rate: number }[] = [
  { minutes: 30, rate: 17590 },
  { minutes: 60, rate: 28600 },
  { minutes: 90, rate: 35200 },
  { minutes: 120, rate: 41800 },
  { minutes: 150, rate: 47300 },
  { minutes: 180, rate: 52800 },
  { minutes: 210, rate: 57200 },
  { minutes: 240, rate: 61600 },
];

// 주야간보호 수가 (시간 단위)
const DAY_CARE_RATES: { hours: number; rate: number }[] = [
  { hours: 3, rate: 30470 },
  { hours: 6, rate: 49660 },
  { hours: 8, rate: 60150 },
  { hours: 10, rate: 68770 },
  { hours: 12, rate: 77580 },
];

const PROCESS_STEPS = [
  {
    step: 1,
    title: "신청",
    duration: "신청 당일",
    desc: "국민건강보험공단 지사 방문 또는 온라인 신청",
    details: [
      "신청 자격: 65세 이상 또는 노인성 질병 진단자",
      "대리 신청 가능 (가족, 의료기관)",
      "온라인: longtermcare.or.kr",
    ],
    color: "bg-primary-500",
  },
  {
    step: 2,
    title: "방문 조사",
    duration: "신청 후 약 2주",
    desc: "공단 조사원이 직접 방문하여 52개 항목 평가",
    details: [
      "신체기능 12개, 인지기능 7개, 행동변화 14개 등",
      "소요 시간: 약 40~60분",
      "준비 사항: 환자 상태 메모, 복용 약 목록",
    ],
    color: "bg-blue-500",
  },
  {
    step: 3,
    title: "등급판정위원회 심의",
    duration: "방문조사 후 약 30일",
    desc: "조사 결과 + 의사 소견서를 바탕으로 등급 판정",
    details: [
      "의사 소견서 필요 (신청 후 제출 가능)",
      "1~5등급, 인지지원등급, 등급 외 중 판정",
    ],
    color: "bg-yellow-500",
  },
  {
    step: 4,
    title: "결과 통보 및 수급",
    duration: "등급 인정 후 즉시",
    desc: "등급 인정서 발급 후 서비스 이용 시작",
    details: [
      "표준 장기요양 이용 계획서 수령",
      "장기요양기관 선택 후 서비스 이용",
      "유효 기간: 1~3년 (갱신 가능)",
    ],
    color: "bg-green-500",
  },
];

const REQUIRED_DOCS = [
  { id: "doc1", label: "장기요양인정 신청서", note: "공단 양식 (지사·온라인 제공)" },
  { id: "doc2", label: "의사 소견서", note: "65세 이상이면 공단이 발급 요청 가능" },
  { id: "doc3", label: "신분증", note: "대리 신청 시 대리인 신분증 + 위임장 필요" },
  { id: "doc4", label: "수급권자증", note: "의료급여수급자의 경우만 해당" },
];

// ─── 본인부담금 계산기 ────────────────────────────────────────────────────

function CopaymentCalculator() {
  const [selectedGradeIdx, setSelectedGradeIdx] = useState(2); // 기본 3등급
  const [copayIdx, setCopayIdx] = useState(0); // 기본 일반 15%
  const [homeCareMinutes, setHomeCareMinutes] = useState(120);
  const [homeCareSessionsPerWeek, setHomeCareSessionsPerWeek] = useState(3);
  const [bathPerMonth, setBathPerMonth] = useState(2);
  const [dayCareHours, setDayCareHours] = useState(0);
  const [dayCareSessionsPerWeek, setDayCareSessionsPerWeek] = useState(0);

  const grade = GRADES[selectedGradeIdx];
  const copayRate = COPAYMENT_RATES[copayIdx].value;

  // 방문요양 계산
  const homeCareRate = HOME_CARE_RATES.find((r) => r.minutes === homeCareMinutes)?.rate ?? 41800;
  const homeCareMonthly = homeCareRate * homeCareSessionsPerWeek * 4;

  // 방문목욕 계산 (차량 기준)
  const bathMonthly = bathPerMonth * 83630;

  // 주야간보호 계산
  const dayCareRate = DAY_CARE_RATES.find((r) => r.hours === dayCareHours)?.rate ?? 0;
  const dayCareMonthly = dayCareRate * dayCareSessionsPerWeek * 4;

  // 5등급/인지지원등급 서비스 제한 체크
  const isGrade5 = grade.gradeNum === 5;
  const isCognitive = grade.gradeNum === 6;
  const dayCareAllowed = !isGrade5; // 5등급은 주야간보호 불가

  const effectiveDayCare = dayCareAllowed ? dayCareMonthly : 0;
  const totalCost = homeCareMonthly + bathMonthly + effectiveDayCare;
  const limitUsagePercent = Math.min((totalCost / grade.monthlyLimit) * 100, 150);
  const isOverLimit = totalCost > grade.monthlyLimit;
  const overLimitAmount = isOverLimit ? totalCost - grade.monthlyLimit : 0;
  const coveredAmount = isOverLimit ? grade.monthlyLimit : totalCost;
  const insuranceCoverage = Math.round(coveredAmount * (1 - copayRate));
  const copayment = Math.round(coveredAmount * copayRate) + overLimitAmount;

  return (
    <div className="space-y-5">
      {/* 등급 선택 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">장기요양등급</label>
        <div className="grid grid-cols-3 gap-2">
          {GRADES.map((g, idx) => (
            <button
              key={g.grade}
              onClick={() => setSelectedGradeIdx(idx)}
              className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                selectedGradeIdx === idx
                  ? `${g.borderColor} ${g.lightColor} ${g.textColor}`
                  : "border-gray-100 text-gray-500 hover:border-gray-200"
              }`}
            >
              {g.grade}
            </button>
          ))}
        </div>
      </div>

      {/* 본인부담금 비율 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">본인부담금 비율</label>
        <div className="space-y-2">
          {COPAYMENT_RATES.map((r, idx) => (
            <button
              key={r.label}
              onClick={() => setCopayIdx(idx)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                copayIdx === idx
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className={`font-semibold ${copayIdx === idx ? "text-primary-700" : "text-gray-700"}`}>
                {r.label}
              </span>
              <span className={`text-xs ${copayIdx === idx ? "text-primary-500" : "text-gray-400"}`}>
                {r.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 서비스 선택 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">희망 서비스</label>
        <div className="space-y-3">
          {/* 방문요양 */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-2">방문요양</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">1회 시간</label>
                <select
                  value={homeCareMinutes}
                  onChange={(e) => setHomeCareMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {HOME_CARE_RATES.map((r) => (
                    <option key={r.minutes} value={r.minutes}>
                      {r.minutes}분 ({r.rate.toLocaleString()}원)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">주 횟수</label>
                <select
                  value={homeCareSessionsPerWeek}
                  onChange={(e) => setHomeCareSessionsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n}회</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 방문목욕 */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-2">방문목욕 (차량, 83,630원/회)</p>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">월 횟수</label>
              <select
                value={bathPerMonth}
                onChange={(e) => setBathPerMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}회</option>
                ))}
              </select>
            </div>
          </div>

          {/* 주야간보호 */}
          <div className={`rounded-xl p-3 ${!dayCareAllowed ? "bg-gray-100 opacity-60" : "bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-800">주야간보호</p>
              {!dayCareAllowed && (
                <span className="text-[10px] text-red-500 font-semibold">
                  {grade.grade}은 이용 불가
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">1회 시간</label>
                <select
                  value={dayCareHours}
                  onChange={(e) => setDayCareHours(Number(e.target.value))}
                  disabled={!dayCareAllowed}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white disabled:cursor-not-allowed"
                >
                  <option value={0}>선택</option>
                  {DAY_CARE_RATES.map((r) => (
                    <option key={r.hours} value={r.hours}>
                      {r.hours}시간 ({r.rate.toLocaleString()}원)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">주 횟수</label>
                <select
                  value={dayCareSessionsPerWeek}
                  onChange={(e) => setDayCareSessionsPerWeek(Number(e.target.value))}
                  disabled={!dayCareAllowed}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white disabled:cursor-not-allowed"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}회</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계산 결과 */}
      <div className="bg-primary-50 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-black text-primary-800">계산 결과</p>

        {/* 한도 사용률 바 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">월 급여 한도 사용률</span>
            <span className={`text-xs font-bold ${isOverLimit ? "text-red-600" : "text-primary-600"}`}>
              {Math.min(Math.round(limitUsagePercent), 100)}%{isOverLimit ? " (초과)" : ""}
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOverLimit ? "bg-red-500" : "bg-primary-500"}`}
              style={{ width: `${Math.min(limitUsagePercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-gray-400">0원</span>
            <span className="text-[10px] text-gray-400">{grade.monthlyLimit.toLocaleString()}원</span>
          </div>
        </div>

        {isOverLimit && (
          <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600">
              급여 한도를 <strong>{overLimitAmount.toLocaleString()}원</strong> 초과합니다.
              초과분은 전액 본인 부담입니다.
            </p>
          </div>
        )}

        {/* 비용 내역 */}
        <div className="bg-white rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">월 총 이용 금액</span>
            <span className="font-semibold text-gray-800">{totalCost.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">장기요양보험 부담</span>
            <span className="font-semibold text-blue-600">{insuranceCoverage.toLocaleString()}원</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between text-sm">
            <span className="font-bold text-gray-800">본인부담금</span>
            <span className="font-black text-primary-600">{copayment.toLocaleString()}원</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          2026년 장기요양 수가 기준 · 실제 금액과 다를 수 있음
        </p>
      </div>

      {/* CTA */}
      <Link href="/search/caregiver">
        <button className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl text-sm hover:bg-primary-600 transition-colors">
          요양보호사 찾기
        </button>
      </Link>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────

export default function CareLevelGuidePage() {
  const [activeTab, setActiveTab] = useState("grade");
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<number | null>(null);

  function toggleDoc(id: string) {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const tabs = [
    { key: "grade", label: "등급 안내" },
    { key: "process", label: "신청 방법" },
    { key: "calculator", label: "비용 계산" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <BackHeader title="장기요양등급 안내" fallbackHref="/home" />

      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-5 pt-5 pb-8">
        <p className="text-teal-100 text-xs">2026년 기준</p>
        <h2 className="text-white text-lg font-black mt-0.5 leading-snug">
          장기요양보험<br />
          <span className="font-medium text-base text-teal-100">등급별 혜택과 신청 방법을 확인하세요</span>
        </h2>
      </div>

      {/* 탭 */}
      <div className="sticky top-12 z-20 bg-white -mt-4 rounded-t-2xl shadow-sm">
        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} variant="underline" />
      </div>

      <div className="px-4 pt-4">
        {/* ── 등급 안내 탭 ── */}
        {activeTab === "grade" && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-2">
              <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                장기요양보험은 고령이나 노인성 질병으로 6개월 이상 일상생활이 어려운 분을 위한 사회보험입니다.
                아래 등급 카드를 탭하면 상세 정보를 볼 수 있습니다.
              </p>
            </div>

            {GRADES.map((g, idx) => (
              <div key={g.grade} className={`bg-white rounded-2xl border ${g.borderColor} overflow-hidden`}>
                <button
                  className="w-full text-left p-4"
                  onClick={() => setSelectedGradeDetail(selectedGradeDetail === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${g.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-black text-lg">{g.gradeNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black ${g.textColor}`}>{g.grade}</p>
                        <ChevronRight
                          size={16}
                          className={`text-gray-300 transition-transform ${selectedGradeDetail === idx ? "rotate-90" : ""}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{g.scoreRange}</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">
                        월 한도 <span className={g.textColor}>{g.monthlyLimit.toLocaleString()}원</span>
                      </p>
                    </div>
                  </div>
                </button>

                {selectedGradeDetail === idx && (
                  <div className={`${g.lightColor} px-4 pb-4 space-y-3 border-t ${g.borderColor}`}>
                    <p className="text-xs text-gray-600 pt-3 leading-relaxed">{g.description}</p>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1.5">이용 가능 서비스</p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.availableServices.map((svc) => (
                          <span
                            key={svc}
                            className={`text-xs ${g.lightColor} ${g.textColor} border ${g.borderColor} px-2.5 py-1 rounded-full font-medium`}
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-600">월 급여 한도</span>
                      <span className={`text-sm font-black ${g.textColor}`}>
                        {g.monthlyLimit.toLocaleString()}원
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab("calculator"); setSelectedGradeDetail(null); }}
                      className={`w-full text-xs font-bold ${g.textColor} bg-white border ${g.borderColor} py-2.5 rounded-xl hover:opacity-80 transition-opacity`}
                    >
                      이 등급으로 본인부담금 계산하기 →
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 복지용구 안내 */}
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-gray-700 mb-1">복지용구</p>
              <p className="text-xs text-gray-500">연간 160만 원 한도 (별도 산정)</p>
              <p className="text-xs text-gray-400 mt-0.5">휠체어, 전동침대, 욕창예방매트 등</p>
            </div>
          </div>
        )}

        {/* ── 신청 방법 탭 ── */}
        {activeTab === "process" && (
          <div className="space-y-4">
            {/* 타임라인 */}
            <div className="relative">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={step.step} className="flex gap-4 relative">
                  {/* 라인 */}
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  {/* 스텝 원 */}
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center flex-shrink-0 z-10`}>
                    <span className="text-white font-black text-lg">{step.step}</span>
                  </div>
                  {/* 내용 */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-black text-gray-900">{step.title}</p>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{step.desc}</p>
                      <div className="space-y-1">
                        {step.details.map((d) => (
                          <div key={d} className="flex items-start gap-1.5">
                            <CheckCircle2 size={11} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-500">{d}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 필요 서류 체크리스트 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList size={15} className="text-primary-500" />
                필요 서류 체크리스트
              </h3>
              <div className="space-y-2">
                {REQUIRED_DOCS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className="w-full flex items-start gap-3 text-left"
                  >
                    {checkedDocs.has(doc.id) ? (
                      <CheckSquare size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${checkedDocs.has(doc.id) ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {doc.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.note}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 공단 연결 버튼 */}
            <a
              href="https://www.longtermcare.or.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-4 rounded-xl text-sm hover:bg-primary-600 transition-colors">
                <ExternalLink size={16} />
                국민건강보험공단 장기요양 신청
              </button>
            </a>
            <p className="text-xs text-gray-400 text-center">
              외부 사이트(longtermcare.or.kr)로 이동합니다
            </p>
          </div>
        )}

        {/* ── 비용 계산 탭 ── */}
        {activeTab === "calculator" && (
          <div>
            <div className="bg-yellow-50 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <Calculator size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 leading-relaxed">
                2026년 장기요양 수가 기준으로 계산됩니다. 실제 금액은 기관별 수가와 본인부담 감경에 따라 다를 수 있습니다.
              </p>
            </div>
            <CopaymentCalculator />
          </div>
        )}
      </div>
    </div>
  );
}
