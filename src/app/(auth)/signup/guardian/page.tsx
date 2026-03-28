"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import BackHeader from "@/components/layout/BackHeader";

const STEPS = ["계정 정보", "기본 정보", "지역 및 어르신 정보"];

interface CareRecipientInput {
  birthYear: string;
  gender: string;
}

export default function GuardianSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Step 2
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 3
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [recipients, setRecipients] = useState<CareRecipientInput[]>([{ birthYear: "", gender: "남성" }]);

  function addRecipient() {
    setRecipients([...recipients, { birthYear: "", gender: "남성" }]);
  }

  function updateRecipient(index: number, field: keyof CareRecipientInput, value: string) {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  }

  function removeRecipient(index: number) {
    setRecipients(recipients.filter((_, i) => i !== index));
  }

  function validateStep() {
    if (step === 0) {
      if (!email || !password || !passwordConfirm) return "모든 항목을 입력해주세요.";
      if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
      if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    }
    if (step === 1) {
      if (!name || !phone) return "모든 항목을 입력해주세요.";
    }
    if (step === 2) {
      if (!region || !district) return "지역을 선택해주세요.";
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
          email,
          password,
          name,
          phone,
          role: "GUARDIAN",
          region,
          district,
          careRecipients: recipients.map((r) => ({
            birthYear: parseInt(r.birthYear),
            gender: r.gender,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "회원가입에 실패했습니다.");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/home");
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <BackHeader title="보호자 회원가입" fallbackHref="/signup" />
      <h1 className="text-xl font-bold text-gray-900 text-center mb-2">보호자 회원가입</h1>

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

      {/* Step 0 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">휴대폰 번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">지역</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">지역 선택</option>
              {["서울", "경기", "인천", "부산"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">구/시</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="ex) 강남구"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">어르신 정보</label>
              <button onClick={addRecipient} className="text-xs text-primary-500 font-semibold">+ 어르신 추가</button>
            </div>
            <div className="space-y-3">
              {recipients.map((recipient, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={recipient.birthYear}
                    onChange={(e) => updateRecipient(i, "birthYear", e.target.value)}
                    placeholder="출생연도 (예: 1945)"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <select
                    value={recipient.gender}
                    onChange={(e) => updateRecipient(i, "gender", e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    <option>남성</option>
                    <option>여성</option>
                  </select>
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => { setError(""); setStep(step - 1); }}
            className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
          >
            {loading ? "가입 중..." : "가입 완료"}
          </button>
        )}
      </div>
    </div>
  );
}
