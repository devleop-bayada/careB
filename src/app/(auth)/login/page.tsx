"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackHeader from "@/components/layout/BackHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="w-full">
      <BackHeader title="로그인" fallbackHref="/" />
      <div className="flex flex-col items-center mb-6">
        <p className="text-sm text-gray-400">어르신의 내일을, 믿음으로 잇다</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">로그인</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#3C1E1E] font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.03 3 3 6.14 3 10c0 2.54 1.64 4.78 4.13 6.07L6.2 19.3c-.07.27.22.49.47.35L10.5 17c.49.06.99.1 1.5.1 4.97 0 9-3.14 9-7s-4.03-7-9-7z" />
          </svg>
          카카오로 로그인
        </button>
        <button className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          <span className="font-black text-base leading-none">N</span>
          네이버로 로그인
        </button>
        <button className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google로 로그인
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="text-primary-500 font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
