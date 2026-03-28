"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function SOSButton({ sessionId }: { sessionId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSOS() {
    setLoading(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);
        if (pos) {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      }

      await fetch("/api/emergency-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, latitude, longitude }),
      });
      setSent(true);
      setShowConfirm(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-bold animate-pulse">
        긴급 신고가 접수되었습니다
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
        aria-label="SOS 긴급 신고"
      >
        <AlertTriangle size={24} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900">긴급 신고</h3>
              <p className="text-sm text-gray-500 mt-1">
                긴급 상황을 신고하시겠습니까?<br />
                현재 위치가 함께 전송됩니다.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSOS}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 disabled:opacity-60"
              >
                {loading ? "전송 중..." : "긴급 신고"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
