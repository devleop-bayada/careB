"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BackHeader from "@/components/layout/BackHeader";

const SITTER_CARE_TYPES = [
  { value: "HOME_CARE", label: "방문요양" },
  { value: "BATH_CARE", label: "방문목욕" },
  { value: "NURSING", label: "방문간호" },
  { value: "COGNITIVE", label: "인지활동" },
  { value: "HOUSEKEEPING", label: "가사지원" },
];

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isGuardian = user?.role === "GUARDIAN";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [education, setEducation] = useState("");
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        setName(u?.name || "");
        setPhone(u?.phone || "");
        if (u?.caregiverProfile) {
          setRegion(u.caregiverProfile.region || "");
          setAddress(u.caregiverProfile.address || "");
          setIntroduction(u.caregiverProfile.introduction || "");
          setHourlyRate(u.caregiverProfile.hourlyRate?.toString() || "");
          setExperienceYears(u.caregiverProfile.experienceYears?.toString() || "");
          setEducation(u.caregiverProfile.education || "");
          try { setServiceCategories(JSON.parse(u.caregiverProfile.serviceCategories || "[]")); } catch {}
        }
        if (u?.guardianProfile) {
          setRegion(u.guardianProfile.region || "");
          setAddress(u.guardianProfile.address || "");
          setIntroduction(u.guardianProfile.introduction || "");
        }
      });
  }, [session]);

  function toggleCareType(v: string) {
    setServiceCategories((prev) =>
      prev.includes(v) ? prev.filter((c) => c !== v) : [...prev, v]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, any> = {
        name, phone, region, address, introduction,
      };
      if (!isGuardian) {
        body.hourlyRate = hourlyRate ? parseInt(hourlyRate) : undefined;
        body.experienceYears = experienceYears ? parseInt(experienceYears) : undefined;
        body.education = education;
        body.serviceCategories = serviceCategories;
      }
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "저장에 실패했습니다.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="프로필 수정" fallbackHref="/my" />

      {success && (
        <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          프로필이 저장되었습니다.
        </div>
      )}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">휴대폰 번호</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">지역</label>
          <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="ex) 서울 강남구"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">상세 주소</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="상세 주소 (선택)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">자기소개</label>
          <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)}
            placeholder="자기소개를 입력하세요" rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
        </div>

        {!isGuardian && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">희망 시급 (원)</label>
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="예: 15000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">경력 (년)</label>
              <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="예: 3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">학력</label>
              <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="최종 학력"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제공 서비스</label>
              <div className="flex flex-wrap gap-2">
                {SITTER_CARE_TYPES.map((c) => (
                  <button key={c.value} type="button" onClick={() => toggleCareType(c.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                      serviceCategories.includes(c.value)
                        ? "border-primary-400 bg-primary-500 text-white"
                        : "border-gray-200 text-gray-600"
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </form>
    </div>
  );
}
