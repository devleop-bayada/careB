"use client";

import { useState } from "react";
import { MapPin, Clock, LogIn, LogOut } from "lucide-react";

export default function CareCheckInOut({ sessionId, isCaregiver }: { sessionId: string; isCaregiver: boolean }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleCheckIn() {
    setLoading(true);
    try {
      const location = await getLocation();
      const res = await fetch(`/api/care-sessions/${sessionId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });
      if (res.ok) {
        const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        setCheckedIn(true);
        setCheckInTime(now);
        if (location) {
          setAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    try {
      const location = await getLocation();
      const res = await fetch(`/api/care-sessions/${sessionId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });
      if (res.ok) {
        const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        setCheckOutTime(now);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (!isCaregiver) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <MapPin size={15} className="text-primary-500" />
        GPS 출퇴근
      </h2>

      {checkInTime && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
            <LogIn size={14} className="text-green-600" />
            <span className="text-xs text-green-700 font-medium">체크인: {checkInTime}</span>
          </div>
          {address && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">{address}</span>
            </div>
          )}
          {checkOutTime && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
              <LogOut size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">체크아웃: {checkOutTime}</span>
            </div>
          )}
        </div>
      )}

      {!checkedIn ? (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <LogIn size={16} />
          {loading ? "위치 확인 중..." : "체크인"}
        </button>
      ) : !checkOutTime ? (
        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          {loading ? "위치 확인 중..." : "체크아웃"}
        </button>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500 font-medium">출퇴근 기록이 완료되었습니다</p>
        </div>
      )}
    </div>
  );
}
