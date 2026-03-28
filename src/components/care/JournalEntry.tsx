import { cn } from '@/lib/utils';
import {
  Activity, Droplets, Moon, Smile, Heart, Thermometer,
  GlassWater, Pill, Dumbbell, Brain, CheckCircle, XCircle
} from 'lucide-react';
import Image from 'next/image';

interface JournalEntryProps {
  title: string;
  date: string;
  activityTags?: string[];
  meals?: string;
  mood?: '좋음' | '보통' | '나쁨';
  content?: string;
  photos?: string[];
  // Health records
  bloodPressure?: string;
  bloodSugar?: string;
  temperature?: string;
  waterIntake?: string;
  bowelMovement?: string;
  medicationTaken?: boolean;
  exerciseLog?: string;
  mentalState?: string;
  sleepQuality?: string;
  className?: string;
}

const moodColors = {
  '좋음': 'text-green-600 bg-green-50',
  '보통': 'text-yellow-600 bg-yellow-50',
  '나쁨': 'text-red-500 bg-red-50',
};

export default function JournalEntry({
  title,
  date,
  activityTags = [],
  meals,
  mood,
  content,
  photos = [],
  bloodPressure,
  bloodSugar,
  temperature,
  waterIntake,
  bowelMovement,
  medicationTaken,
  exerciseLog,
  mentalState,
  sleepQuality,
  className,
}: JournalEntryProps) {
  const hasHealthRecords = bloodPressure || bloodSugar || temperature || waterIntake || bowelMovement ||
    medicationTaken !== undefined || exerciseLog || mentalState || sleepQuality;

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4 space-y-3', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        {mood && (
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1', moodColors[mood])}>
            <Smile className="h-3.5 w-3.5" />
            {mood}
          </span>
        )}
      </div>

      {/* Activity tags */}
      {activityTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activityTags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Info row */}
      <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
        {meals && (
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-gray-400" />
            {meals}
          </span>
        )}
      </div>

      {/* Health records grid */}
      {hasHealthRecords && (
        <div className="bg-blue-50 rounded-xl px-3 py-3 space-y-2">
          <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            건강 기록
          </p>
          <div className="grid grid-cols-3 gap-2">
            {bloodPressure && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Heart className="h-3.5 w-3.5 text-red-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">혈압</p>
                <p className="text-xs font-bold text-gray-900">{bloodPressure}</p>
              </div>
            )}
            {bloodSugar && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Droplets className="h-3.5 w-3.5 text-red-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">혈당</p>
                <p className="text-xs font-bold text-gray-900">{bloodSugar} mg/dL</p>
              </div>
            )}
            {temperature && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Thermometer className="h-3.5 w-3.5 text-primary-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">체온</p>
                <p className="text-xs font-bold text-gray-900">{temperature}°C</p>
              </div>
            )}
            {waterIntake && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <GlassWater className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">수분섭취</p>
                <p className="text-xs font-bold text-gray-900">{waterIntake}ml</p>
              </div>
            )}
            {bowelMovement && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Activity className="h-3.5 w-3.5 text-amber-500 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">배변</p>
                <p className="text-xs font-bold text-gray-900">{bowelMovement}</p>
              </div>
            )}
            {medicationTaken !== undefined && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Pill className="h-3.5 w-3.5 text-green-500 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">투약</p>
                <p className={cn('text-xs font-bold', medicationTaken ? 'text-green-600' : 'text-red-500')}>
                  {medicationTaken ? '완료' : '미완료'}
                </p>
              </div>
            )}
            {mentalState && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Brain className="h-3.5 w-3.5 text-purple-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">정신상태</p>
                <p className="text-xs font-bold text-gray-900">{mentalState}</p>
              </div>
            )}
            {sleepQuality && (
              <div className="bg-white rounded-lg px-2.5 py-2 text-center">
                <Moon className="h-3.5 w-3.5 text-indigo-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">수면</p>
                <p className="text-xs font-bold text-gray-900">{sleepQuality}</p>
              </div>
            )}
          </div>
          {exerciseLog && (
            <div className="bg-white rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Dumbbell className="h-3 w-3 text-green-500" />
                운동/재활
              </p>
              <p className="text-xs font-medium text-gray-900 mt-0.5">{exerciseLog}</p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {content && (
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image src={photo} alt={`사진 ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
