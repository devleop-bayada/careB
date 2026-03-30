"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, Ban, UserX, CheckCircle } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  GUARDIAN: "보호자",
  CAREGIVER: "요양보호사",
  ADMIN: "관리자",
  INSTITUTION: "기관",
};

const MATCH_STATUS: Record<string, string> = {
  PENDING: "대기",
  ACCEPTED: "수락",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: "대기",
  COMPLETED: "완료",
  FAILED: "실패",
  CANCELLED: "취소",
  REFUNDED: "환불",
};

const REPORT_TYPE: Record<string, string> = {
  INAPPROPRIATE_BEHAVIOR: "부적절한 행동",
  NO_SHOW: "노쇼",
  FRAUD: "사기",
  HARASSMENT: "괴롭힘",
  QUALITY_ISSUE: "서비스 품질",
  OTHER: "기타",
};

const REPORT_STATUS: Record<string, string> = {
  PENDING: "대기",
  INVESTIGATING: "조사중",
  RESOLVED: "해결",
  DISMISSED: "기각",
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUser(); }, [id]);

  async function handleAction(action: string) {
    const msg = action === "ban" ? "정말 정지하시겠습니까?" : action === "deactivate" ? "정말 해지하시겠습니까?" : "활성화하시겠습니까?";
    if (!confirm(msg)) return;
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchUser();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 text-gray-400">
        회원을 찾을 수 없습니다.
      </div>
    );
  }

  const matches = user.guardianProfile?.matchesAsGuardian ?? user.caregiverProfile?.matchesAsCaregiver ?? [];
  const reviews = user.guardianProfile?.reviewsWritten ?? user.caregiverProfile?.reviewsReceived ?? [];

  const TABS = [
    { key: "info", label: "기본 정보" },
    { key: "matches", label: `매칭 (${matches.length})` },
    { key: "payments", label: `결제 (${user.payments?.length ?? 0})` },
    { key: "reviews", label: `리뷰 (${reviews.length})` },
    { key: "reports", label: `신고 (${(user.reportsMade?.length ?? 0) + (user.reportsReceived?.length ?? 0)})` },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email ?? user.phone} · {ROLE_LABEL[user.role] ?? user.role}</p>
        </div>
        <div className="flex gap-2">
          {user.isActive && !user.isBanned && (
            <>
              <button onClick={() => handleAction("ban")} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                <Ban size={14} /> 정지
              </button>
              <button onClick={() => handleAction("deactivate")} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                <UserX size={14} /> 해지
              </button>
            </>
          )}
          {(user.isBanned || !user.isActive) && (
            <button onClick={() => handleAction("activate")} className="flex items-center gap-1.5 px-3 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50">
              <CheckCircle size={14} /> 활성화
            </button>
          )}
        </div>
      </div>

      {/* 상태 배지 */}
      <div className="flex gap-2">
        {user.isBanned ? (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-50 text-red-600">정지됨</span>
        ) : !user.isActive ? (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-500">해지됨</span>
        ) : (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-50 text-green-600">활성</span>
        )}
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-50 text-blue-600">
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {tab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="이름" value={user.name} />
            <InfoRow label="이메일" value={user.email ?? "-"} />
            <InfoRow label="전화번호" value={user.phone} />
            <InfoRow label="역할" value={ROLE_LABEL[user.role] ?? user.role} />
            <InfoRow label="가입일" value={new Date(user.createdAt).toLocaleDateString("ko-KR")} />
            <InfoRow label="최근 수정" value={new Date(user.updatedAt).toLocaleDateString("ko-KR")} />
            {user.guardianProfile && (
              <>
                <InfoRow label="지역" value={user.guardianProfile.region || "-"} />
                <InfoRow label="주소" value={user.guardianProfile.address ?? "-"} />
                <InfoRow label="관계" value={user.guardianProfile.relationship ?? "-"} />
              </>
            )}
            {user.caregiverProfile && (
              <>
                <InfoRow label="지역" value={user.caregiverProfile.region || "-"} />
                <InfoRow label="성별" value={user.caregiverProfile.gender === "MALE" ? "남성" : "여성"} />
                <InfoRow label="경력" value={`${user.caregiverProfile.experienceYears}년`} />
                <InfoRow label="시급" value={`${user.caregiverProfile.hourlyRate.toLocaleString()}원`} />
                <InfoRow label="평점" value={`${user.caregiverProfile.averageRating} (${user.caregiverProfile.totalReviews}건)`} />
                <InfoRow label="등급" value={user.caregiverProfile.grade} />
              </>
            )}
          </div>
        )}

        {tab === "matches" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">ID</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">서비스</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {matches.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">매칭 이력이 없습니다.</td></tr>
              ) : matches.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{m.id.slice(0, 8)}</td>
                  <td className="px-4 py-2.5">{m.serviceCategory}</td>
                  <td className="px-4 py-2.5">{MATCH_STATUS[m.status] ?? m.status}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(m.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "payments" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">상품</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">금액</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">상태</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(user.payments?.length ?? 0) === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">결제 이력이 없습니다.</td></tr>
              ) : user.payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">{p.productType}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{p.amount.toLocaleString()}원</td>
                  <td className="px-4 py-2.5">{PAYMENT_STATUS[p.status] ?? p.status}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(p.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "reviews" && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="py-8 text-center text-gray-400">리뷰 이력이 없습니다.</p>
            ) : reviews.map((r: any) => (
              <div key={r.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 font-bold">{"★".repeat(r.overallRating)}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
                <p className="text-sm text-gray-700">{r.content}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            {user.reportsReceived?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">받은 신고</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">유형</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">상태</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {user.reportsReceived.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2">{REPORT_TYPE[r.type] ?? r.type}</td>
                        <td className="px-4 py-2">{REPORT_STATUS[r.status] ?? r.status}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {user.reportsMade?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">작성한 신고</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">유형</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">상태</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {user.reportsMade.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2">{REPORT_TYPE[r.type] ?? r.type}</td>
                        <td className="px-4 py-2">{REPORT_STATUS[r.status] ?? r.status}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(user.reportsMade?.length ?? 0) === 0 && (user.reportsReceived?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-gray-400">신고 이력이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
