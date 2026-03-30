"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle } from "lucide-react";

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  type: "SIGNUP" | "LOGIN" | "PASSWORD_RESET";
  disabled?: boolean;
}

const TIMER_SECONDS = 180; // 3분
const COOLDOWN_SECONDS = 60; // 재발송 쿨다운
const DAILY_LIMIT = 5;

export default function PhoneVerification({
  phone,
  onVerified,
  type,
  disabled = false,
}: PhoneVerificationProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 인증 타이머 (3분)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 재발송 쿨다운 (60초)
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 오늘 남은 발송 횟수
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // 전화번호 유효성: 010-xxxx-xxxx (11자리)
  const isPhoneValid = /^010-\d{4}-\d{4}$/.test(phone);

  const startTimer = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  async function handleSend() {
    if (!isPhoneValid || disabled || sending || cooldown > 0) return;
    setSending(true);
    setError("");
    setCode("");

    try {
      const res = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "발송에 실패했습니다.");
        return;
      }

      setCodeSent(true);
      setRemainingToday(data.remainingToday ?? null);
      startTimer();
      startCooldown();

      // 개발 모드: devCode가 있으면 자동 입력
      if (data.devCode) {
        setCode(data.devCode);
      }

      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(inputCode: string) {
    if (inputCode.length !== 6 || verifying || verified) return;
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: inputCode, type }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "인증에 실패했습니다.");
        setCode("");
        codeInputRef.current?.focus();
        return;
      }

      setVerified(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      onVerified();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    setError("");
    if (val.length === 6) {
      handleVerify(val);
    }
  }

  const sendBtnDisabled =
    !isPhoneValid || disabled || sending || cooldown > 0 || verified ||
    (remainingToday !== null && remainingToday <= 0);

  return (
    <div className="space-y-3">
      {/* 발송 버튼 행 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={sendBtnDisabled}
          className="shrink-0 px-4 py-3 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {sending
            ? "발송 중..."
            : cooldown > 0
            ? `재발송 (${cooldown}초)`
            : codeSent
            ? "재발송"
            : "인증코드 발송"}
        </button>

        {remainingToday !== null && !verified && (
          <span className="flex items-center text-xs text-gray-400">
            오늘 남은 발송 횟수: {remainingToday}/{DAILY_LIMIT}회
          </span>
        )}
      </div>

      {/* 코드 입력 영역 */}
      {codeSent && !verified && (
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              placeholder="인증코드 6자리"
              maxLength={6}
              disabled={verifying || timeLeft === 0}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
            {/* 타이머 */}
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                timeLeft <= 30 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {timeLeft > 0 ? formatTime(timeLeft) : "만료"}
            </span>
          </div>

          {timeLeft === 0 && (
            <p className="text-xs text-red-500">
              인증코드가 만료되었습니다. 재발송 버튼을 눌러주세요.
            </p>
          )}

          {verifying && (
            <p className="text-xs text-gray-500">인증 확인 중...</p>
          )}
        </div>
      )}

      {/* 인증 완료 */}
      {verified && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
          <CheckCircle size={18} />
          <span>인증이 완료되었습니다.</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
