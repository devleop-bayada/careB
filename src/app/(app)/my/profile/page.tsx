"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import BackHeader from "@/components/layout/BackHeader";
import Avatar from "@/components/ui/Avatar";

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        setName(u?.name || "");
        setPhone(u?.phone || "");
        setProfileImage(u?.profileImage || null);
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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 즉시 미리보기
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // 업로드
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setError(data.error || "이미지 업로드에 실패했습니다.");
        setImagePreview(null);
        return;
      }
      const { url } = await uploadRes.json();

      // profileImage 업데이트
      const patchRes = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: url }),
      });
      if (!patchRes.ok) {
        const data = await patchRes.json();
        setError(data.error || "프로필 이미지 저장에 실패했습니다.");
        setImagePreview(null);
        return;
      }
      setProfileImage(url);
    } catch {
      setError("이미지 업로드 중 오류가 발생했습니다.");
      setImagePreview(null);
    } finally {
      setImageUploading(false);
      // objectUrl 메모리 해제
      URL.revokeObjectURL(objectUrl);
    }
  }

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
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div
            className="relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar
              src={imagePreview || profileImage}
              name={name || "사용자"}
              size="xl"
            />
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30">
              {imageUploading ? (
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500">사진 변경</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

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
              <input type="text" inputMode="numeric" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value.replace(/\D/g, ""))} placeholder="예: 15000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">경력 (년)</label>
              <input type="text" inputMode="numeric" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value.replace(/\D/g, ""))} placeholder="예: 3"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}
