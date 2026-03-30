"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Image as ImageIcon, Heart, Droplets, Thermometer,
  GlassWater, Pill, Dumbbell, Brain, Moon
} from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import CustomSelect from "@/components/ui/CustomSelect";

const ACTIVITIES = [
  { value: "meal", label: "🍚 식사" },
  { value: "exercise", label: "🚶 운동/산책" },
  { value: "medication", label: "💊 투약" },
  { value: "outdoor", label: "🌳 외출" },
  { value: "cognitive", label: "🧠 인지활동" },
  { value: "bath", label: "🛁 목욕" },
];

const MOODS = [
  { value: "great", label: "최고", emoji: "😄" },
  { value: "good", label: "좋음", emoji: "🙂" },
  { value: "normal", label: "보통", emoji: "😐" },
  { value: "bad", label: "힘듦", emoji: "😔" },
];

const BOWEL_OPTIONS = [
  { value: "", label: "선택" },
  { value: "정상", label: "정상" },
  { value: "설사", label: "설사" },
  { value: "변비", label: "변비" },
  { value: "없음", label: "없음" },
];

const MENTAL_STATE_OPTIONS = [
  { value: "", label: "선택" },
  { value: "양호", label: "양호" },
  { value: "불안", label: "불안" },
  { value: "혼란", label: "혼란" },
  { value: "졸음", label: "졸음" },
];

const SLEEP_QUALITY_OPTIONS = [
  { value: "", label: "선택" },
  { value: "양호", label: "양호" },
  { value: "보통", label: "보통" },
  { value: "불량", label: "불량" },
];

export default function JournalWritePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [title, setTitle] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [mood, setMood] = useState("good");
  const [meals, setMeals] = useState("");
  const [napStart, setNapStart] = useState("");
  const [napEnd, setNapEnd] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Health vitals
  const [bloodPressure, setBloodPressure] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [bowelMovement, setBowelMovement] = useState("");
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [exerciseLog, setExerciseLog] = useState("");
  const [mentalState, setMentalState] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = 5 - photos.length;
    const toUpload = files.slice(0, remaining);
    setUploadingPhoto(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.url ?? data.fileUrl ?? "");
        }
      }
      setPhotos((prev) => [...prev, ...uploaded.filter(Boolean)]);
    } catch {
      // ignore
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  function toggleActivity(v: string) {
    setActivities((prev) => prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/care-sessions/${sessionId}/journals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          activities: JSON.stringify(activities),
          mood,
          meals,
          napStart: napStart || undefined,
          napEnd: napEnd || undefined,
          bloodPressure: bloodPressure || undefined,
          bloodSugar: bloodSugar || undefined,
          temperature: temperature || undefined,
          waterIntake: waterIntake || undefined,
          bowelMovement: bowelMovement || undefined,
          medicationTaken,
          exerciseLog: exerciseLog || undefined,
          mentalState: mentalState || undefined,
          sleepQuality: sleepQuality || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "일지 저장에 실패했습니다.");
        setLoading(false);
        return;
      }
      router.push(`/care/${sessionId}`);
    } catch {
      setError("저장 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="돌봄 일지 작성" fallbackHref="/care" />

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">날짜</label>
          <p className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘의 일지 제목"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">활동 (복수 선택)</label>
          <div className="grid grid-cols-3 gap-2">
            {ACTIVITIES.map((act) => (
              <button
                key={act.value}
                type="button"
                onClick={() => toggleActivity(act.value)}
                className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  activities.includes(act.value)
                    ? "border-primary-400 bg-primary-50 text-primary-600"
                    : "border-gray-100 text-gray-600 hover:border-gray-200"
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">어르신 컨디션</label>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`py-3 rounded-xl text-center border-2 transition-all ${
                  mood === m.value ? "border-primary-400 bg-primary-50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="text-xl">{m.emoji}</div>
                <div className={`text-[10px] font-medium mt-1 ${mood === m.value ? "text-primary-600" : "text-gray-500"}`}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">식사 내용</label>
          <input
            type="text"
            value={meals}
            onChange={(e) => setMeals(e.target.value)}
            placeholder="예: 아침 - 죽, 점심 - 밥과 반찬"
            className={inputClass}
          />
        </div>

        {/* Health Vitals Section */}
        <div className="bg-blue-50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-blue-600" />
            <span className="text-sm font-bold text-blue-900">건강 기록</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Heart size={13} className="text-red-400" />
                혈압
              </label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="120/80"
                className={inputClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Droplets size={13} className="text-red-400" />
                혈당 (mg/dL)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value.replace(/\D/g, ""))}
                placeholder="100"
                className={inputClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Thermometer size={13} className="text-primary-400" />
                체온 (&deg;C)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="36.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <GlassWater size={13} className="text-blue-400" />
                수분섭취 (ml)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value.replace(/\D/g, ""))}
                placeholder="500"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">배변 상태</label>
              <CustomSelect
                value={bowelMovement}
                onChange={setBowelMovement}
                options={BOWEL_OPTIONS}
                placeholder="선택"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Brain size={13} className="text-purple-400" />
                정신 상태
              </label>
              <CustomSelect
                value={mentalState}
                onChange={setMentalState}
                options={MENTAL_STATE_OPTIONS}
                placeholder="선택"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Moon size={13} className="text-indigo-400" />
              수면 품질
            </label>
            <CustomSelect
              value={sleepQuality}
              onChange={setSleepQuality}
              options={SLEEP_QUALITY_OPTIONS}
              placeholder="선택"
            />
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
            <input
              type="checkbox"
              id="medicationTaken"
              checked={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <label htmlFor="medicationTaken" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Pill size={14} className="text-green-500" />
              투약 완료
            </label>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Dumbbell size={13} className="text-green-500" />
              운동/재활 기록
            </label>
            <textarea
              value={exerciseLog}
              onChange={(e) => setExerciseLog(e.target.value)}
              placeholder="운동/재활 활동 내용을 기록해주세요..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">수면 시간</label>
          <div className="flex items-center gap-2">
            <input type="time" value={napStart} onChange={(e) => setNapStart(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            <span className="text-gray-400 text-sm font-medium">~</span>
            <input type="time" value={napEnd} onChange={(e) => setNapEnd(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">오늘의 요양 일지 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 요양 중 있었던 일을 자세히 적어주세요..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">사진 첨부 (최대 5장)</label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 px-4 py-3 rounded-xl w-full justify-center hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              <ImageIcon size={18} />
              {uploadingPhoto ? "업로드 중..." : "사진 추가"}
            </button>
          )}
        </div>

        <div className="pb-32">
          <button type="submit" disabled={loading || !title.trim() || !content.trim()}
            className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60">
            {loading ? "저장 중..." : "일지 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
