"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import CustomSelect from "@/components/ui/CustomSelect";

const STEPS = ["계정 정보", "요양보호사 정보"];

const CAREGIVER_TYPES = [
  { value: "CARE_WORKER", label: "요양보호사", desc: "요양보호사 자격증 보유" },
  { value: "NURSING_ASSISTANT", label: "간호조무사", desc: "간호조무사 자격증 보유" },
  { value: "SOCIAL_WORKER", label: "사회복지사", desc: "사회복지사 자격증 보유" },
  { value: "NURSE", label: "간호사", desc: "간호사 면허 보유" },
];

const CARE_TYPES = [
  { value: "HOME_CARE", label: "방문요양" },
  { value: "BATH_CARE", label: "방문목욕" },
  { value: "NURSING", label: "방문간호" },
  { value: "COGNITIVE", label: "인지활동" },
  { value: "HOUSEKEEPING", label: "가사지원" },
];

const REGION_OPTIONS = [
  { value: "서울", label: "서울" },
  { value: "경기", label: "경기" },
  { value: "인천", label: "인천" },
  { value: "부산", label: "부산" },
];

export default function CaregiverSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");

  // Step 1
  const [caregiverType, setCaregiverType] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);

  function formatPhone(value: string) {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  }

  function toggleCareType(value: string) {
    setSelectedCareTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function validateStep() {
    if (step === 0) {
      if (!phone || !password || !passwordConfirm || !name) return "모든 항목을 입력해주세요.";
      if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
      if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
      if (!/^010-?\d{4}-?\d{4}$/.test(phone.replace(/-/g, "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3"))) return "올바른 전화번호를 입력해주세요.";
    }
    if (step === 1) {
      if (!caregiverType) return "요양보호사 유형을 선택해주세요.";
      if (!region || !district) return "지역을 선택해주세요.";
      if (!hourlyRate) return "희망 시급을 입력해주세요.";
      if (selectedCareTypes.length === 0) return "제공 서비스를 1개 이상 선택해주세요.";
    }
    return "";
  }

  function handleNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(step + 1);
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          name,
          role: "CAREGIVER",
          sitterType: caregiverType,
          region,
          district,
          hourlyRate: parseInt(hourlyRate),
          careTypes: selectedCareTypes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "회원가입에 실패했습니다.");
        setLoading(false);
        return;
      }
      await signIn("credentials", { phone, password, redirect: false });
      router.push("/home");
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold text-gray-900 text-center mb-2">요양보호사 회원가입</h1>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs font-medium ${i <= step ? "text-primary-500" : "text-gray-400"}`}>
              {s}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Step 0: 계정 정보 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">휴대폰 번호</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8자 이상 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
      )}

      {/* Step 1: 요양보호사 정보 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요양보호사 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {CAREGIVER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setCaregiverType(t.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    caregiverType === t.value
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">지역</label>
            <CustomSelect
              value={region}
              onChange={setRegion}
              options={REGION_OPTIONS}
              placeholder="지역 선택"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">구/시</label>
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="ex) 강남구"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">희망 시급 (원)</label>
            <input type="text" inputMode="numeric" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value.replace(/\D/g, ""))} placeholder="예: 15000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제공 서비스 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {CARE_TYPES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCareType(c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                    selectedCareTypes.includes(c.value)
                      ? "border-primary-400 bg-primary-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => { setError(""); setStep(step - 1); }}
            className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
            이전
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={handleNext}
            className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors">
            다음
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60">
            {loading ? "가입 중..." : "가입 완료"}
          </button>
        )}
      </div>
    </div>
  );
}
