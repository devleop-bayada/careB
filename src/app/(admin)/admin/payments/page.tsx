"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, TrendingUp, ArrowDownRight, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface PaymentItem {
  id: string;
  orderId: string;
  amount: number;
  method: string | null;
  status: string;
  productType: string;
  createdAt: string;
  user: { name: string; email: string | null };
}

interface SettlementItem {
  id: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  caregiver: { user: { name: string } };
  careSession: { scheduledDate: string };
}

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: "대기",
  COMPLETED: "완료",
  FAILED: "��패",
  CANCELLED: "취소",
  REFUNDED: "환불",
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  COMPLETED: "bg-green-50 text-green-600",
  FAILED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
  REFUNDED: "bg-orange-50 text-orange-600",
};

const SETTLEMENT_STATUS: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  DISPUTED: "분쟁",
  PAID: "지급완료",
  CANCELLED: "취소",
};

const SETTLEMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  DISPUTED: "bg-red-50 text-red-600",
  PAID: "bg-green-50 text-green-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const PRODUCT_LABEL: Record<string, string> = {
  PASS_SINGLE: "1회 이용권",
  PASS_FIVE: "5회 이용권",
  PASS_TEN: "10회 이용권",
  SUB_STANDARD: "스탠다드 구독",
  SUB_PREMIUM: "프리미엄 구독",
  SUB_FAMILY: "패밀리 구독",
};

const TABS = [
  { key: "payments", label: "결제 내역" },
  { key: "settlements", label: "정산 관리" },
  { key: "refunds", label: "환불 처리" },
];

export default function PaymentsPage() {
  const [tab, setTab] = useState("payments");
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, monthRevenue: 0, totalRefund: 0, feeIncome: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedSettlements, setSelectedSettlements] = useState<string[]>([]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("tab", tab === "refunds" ? "refunds" : "payments");
      if (statusFilter && tab === "payments") params.set("status", statusFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPayments(data.payments);
      setStats(data.stats);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettlements() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/settlements?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettlements(data.settlements);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "settlements") {
      fetchSettlements();
    } else {
      fetchPayments();
    }
    setSelectedSettlements([]);
  }, [page, tab, statusFilter, fromDate, toDate]);

  async function handleSettlementAction(action: string) {
    if (selectedSettlements.length === 0) return;
    const msg = action === "pay" ? "선택한 정산을 지급 처리하시겠습니까?" : "선택한 정산을 확정하시겠습니까?";
    if (!confirm(msg)) return;
    await fetch("/api/admin/settlements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedSettlements, action }),
    });
    setSelectedSettlements([]);
    fetchSettlements();
  }

  function toggleSettlement(id: string) {
    setSelectedSettlements((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤��� */}
      <div>
        <h1 className="text-xl font-black text-gray-900">결제/정산 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">결제 내역 및 정산 현황을 관리합니다.</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 거래액"
          value={`${Math.round(stats.totalRevenue / 10000).toLocaleString()}만`}
          unit="원"
          icon={<CreditCard size={18} />}
          color="blue"
        />
        <StatCard
          title="이번 달 거래액"
          value={`${Math.round(stats.monthRevenue / 10000).toLocaleString()}만`}
          unit="원"
          icon={<DollarSign size={18} />}
          color="green"
        />
        <StatCard
          title="수수료 수입"
          value={`${Math.round(stats.feeIncome / 10000).toLocaleString()}만`}
          unit="원"
          icon={<TrendingUp size={18} />}
          color="purple"
        />
        <StatCard
          title="환불 총액"
          value={`${Math.round(stats.totalRefund / 10000).toLocaleString()}만`}
          unit="원"
          icon={<ArrowDownRight size={18} />}
          color="red"
        />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); setStatusFilter(""); }}
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

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-gray-400" />
        {tab === "payments" && (
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
          >
            <option value="">상태 전체</option>
            <option value="COMPLETED">완료</option>
            <option value="PENDING">대기</option>
            <option value="FAILED">실패</option>
            <option value="CANCELLED">취소</option>
          </select>
        )}
        {tab === "settlements" && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="">상태 전체</option>
              <option value="PENDING">대기</option>
              <option value="CONFIRMED">확정</option>
              <option value="PAID">지급완료</option>
              <option value="DISPUTED">분쟁</option>
            </select>
            {selectedSettlements.length > 0 && (
              <div className="flex gap-2 ml-auto">
                <button onClick={() => handleSettlementAction("confirm")} className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  확정 ({selectedSettlements.length})
                </button>
                <button onClick={() => handleSettlementAction("pay")} className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600">
                  지급 ({selectedSettlements.length})
                </button>
              </div>
            )}
          </>
        )}
        {tab !== "settlements" && (
          <>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <span className="text-gray-400 text-sm">~</span>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </>
        )}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "settlements" ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedSettlements.length === settlements.length && settlements.length > 0}
                      onChange={(e) => setSelectedSettlements(e.target.checked ? settlements.map((s) => s.id) : [])}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">요양보호���</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">금액</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">수수��</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">실수령</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">돌봄일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : settlements.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">정산 데이터가 없습니다.</td></tr>
                ) : settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selectedSettlements.includes(s.id)} onChange={() => toggleSettlement(s.id)} className="rounded" />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{s.caregiver.user.name}</td>
                    <td className="px-5 py-3 text-right">{s.amount.toLocaleString()}원</td>
                    <td className="px-5 py-3 text-right text-gray-500">{s.platformFee.toLocaleString()}원</td>
                    <td className="px-5 py-3 text-right font-semibold">{s.netAmount.toLocaleString()}원</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${SETTLEMENT_STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {SETTLEMENT_STATUS[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(s.careSession.scheduledDate).toLocaleDateString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">주문번호</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">사용자</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상품</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">금액</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">상태</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">결���일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">결제 데이터가 없습니다.</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.orderId}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{p.user.name}</td>
                    <td className="px-5 py-3 text-gray-700">{PRODUCT_LABEL[p.productType] ?? p.productType}</td>
                    <td className="px-5 py-3 text-right font-semibold">{p.amount.toLocaleString()}��</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${PAYMENT_STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {PAYMENT_STATUS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{total}건</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
