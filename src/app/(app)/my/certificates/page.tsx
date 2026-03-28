"use client";

import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, Upload, Shield } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";

const CERT_STEPS = [
  { id: "identity", step: 1, label: "본인인증", desc: "주민등록증 또는 운전면허증으로 본인 확인" },
  { id: "qualification", step: 2, label: "자격증", desc: "요양보호사 국가자격증 제출" },
  { id: "background", step: 3, label: "신원확인", desc: "주민등록등본 및 신원확인서" },
  { id: "criminal", step: 4, label: "범죄경력", desc: "경찰청 발급 범죄경력회보서" },
  { id: "health", step: 5, label: "건강진단", desc: "최근 1년 이내 건강검진 결과서" },
  { id: "insurance", step: 6, label: "보험가입", desc: "배상책임보험 가입 증빙서류" },
  { id: "education", step: 7, label: "교육이수", desc: "요양보호사 보수교육 이수증" },
];

type StepStatus = "completed" | "in_progress" | "pending";

export default function CertificatesPage() {
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const completed = Object.values(statuses).filter((s) => s === "completed").length;
  const inProgress = Object.values(statuses).filter((s) => s === "in_progress").length;

  function getStatus(id: string): StepStatus {
    return statuses[id] || "pending";
  }

  function handleUpload(id: string) {
    setUploading(id);
    setTimeout(() => {
      setStatuses((prev) => ({ ...prev, [id]: "in_progress" }));
      setUploading(null);
    }, 1200);
  }

  function getStatusBadge(status: StepStatus) {
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
            <CheckCircle size={13} className="text-green-500" />
            <span className="text-xs text-green-700 font-semibold">완료</span>
          </div>
        );
      case "in_progress":
        return (
          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full">
            <Clock size={13} className="text-yellow-500" />
            <span className="text-xs text-yellow-700 font-semibold">진행중</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
            <AlertCircle size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-semibold">미완료</span>
          </div>
        );
    }
  }

  function getStepColor(status: StepStatus) {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-yellow-400 text-white";
      default: return "bg-gray-200 text-gray-500";
    }
  }

  function getLineColor(status: StepStatus) {
    switch (status) {
      case "completed": return "bg-green-400";
      default: return "bg-gray-200";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="자격 관리" fallbackHref="/my" />

      {/* 7-Step Progress Bar */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Shield size={15} className="text-primary-500" />
            인증 진행 현황
          </p>
          <p className="text-sm font-bold text-primary-500">{completed}/7</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {CERT_STEPS.map((step, i) => {
            const status = getStatus(step.id);
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${getStepColor(status)}`}>
                  {status === "completed" ? (
                    <CheckCircle size={14} />
                  ) : (
                    step.step
                  )}
                </div>
                {i < CERT_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-0.5 rounded-full ${getLineColor(status)}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed / 7) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-600">완료 {completed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-xs text-gray-600">진행중 {inProgress}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="text-xs text-gray-600">미완료 {7 - completed - inProgress}</span>
          </div>
        </div>
      </div>

      {/* Step Cards */}
      <div className="px-4 mt-4 space-y-2 pb-8">
        {CERT_STEPS.map((cert) => {
          const status = getStatus(cert.id);
          return (
            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${getStepColor(status)}`}>
                    {status === "completed" ? (
                      <CheckCircle size={14} />
                    ) : (
                      cert.step
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{cert.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cert.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {getStatusBadge(status)}
                  {status === "pending" && (
                    <button
                      onClick={() => handleUpload(cert.id)}
                      disabled={uploading === cert.id}
                      className="flex items-center gap-1 text-xs text-primary-500 font-semibold bg-primary-50 px-2.5 py-1 rounded-full hover:bg-primary-100 transition-colors disabled:opacity-60"
                    >
                      <Upload size={11} />
                      {uploading === cert.id ? "업로드 중..." : "서류 제출"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
