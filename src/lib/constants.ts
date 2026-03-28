export const SERVICE_CATEGORIES = [
  { value: "HOME_CARE", label: "방문요양", icon: "Home", description: "재가 어르신 신체활동·가사지원" },
  { value: "HOME_BATH", label: "방문목욕", icon: "Droplets", description: "이동 목욕차량 방문 목욕 서비스" },
  { value: "HOME_NURSING", label: "방문간호", icon: "Stethoscope", description: "간호사·간호조무사 방문 의료 서비스" },
  { value: "DAY_NIGHT_CARE", label: "주야간보호", icon: "Sun", description: "시설 통원 낮/밤 돌봄" },
  { value: "SHORT_TERM_CARE", label: "단기보호", icon: "Clock", description: "시설 단기 입소 (최대 9일)" },
  { value: "HOURLY_CARE", label: "시간제돌봄", icon: "Timer", description: "비급여 맞춤 시간제 돌봄" },
  { value: "HOSPITAL_CARE", label: "병원간병", icon: "Hospital", description: "입원 환자 24시간 간병" },
  { value: "DEMENTIA_CARE", label: "치매전문", icon: "Brain", description: "치매 어르신 특화 돌봄" },
  { value: "HOSPICE_CARE", label: "임종돌봄", icon: "HeartHandshake", description: "호스피스·완화 의료 연계" },
] as const;

export const SERVICE_CATEGORY_MAP = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.value, c.label])
);

export const CAREGIVER_TYPES = [
  { value: "CARE_WORKER", label: "요양보호사", description: "요양보호사 자격증 보유" },
  { value: "NURSING_AIDE", label: "간호조무사", description: "간호조무사 면허 보유" },
  { value: "SOCIAL_WORKER", label: "사회복지사", description: "사회복지사 자격증 보유" },
  { value: "NURSE", label: "간호사", description: "간호사 면허 보유" },
] as const;

export const CAREGIVER_TYPE_MAP = Object.fromEntries(
  CAREGIVER_TYPES.map((c) => [c.value, c.label])
);

export const CARE_LEVELS = [
  { value: "LEVEL_1", label: "1등급", description: "최중증 (일상생활 전적 도움 필요)" },
  { value: "LEVEL_2", label: "2등급", description: "중증 (상당 부분 도움 필요)" },
  { value: "LEVEL_3", label: "3등급", description: "중등증 (부분적 도움 필요)" },
  { value: "LEVEL_4", label: "4등급", description: "경증 (일정 부분 도움 필요)" },
  { value: "LEVEL_5", label: "5등급", description: "경증 (경미한 도움 필요)" },
  { value: "COGNITIVE_SUPPORT", label: "인지지원등급", description: "치매 환자 인지 지원" },
] as const;

export const CARE_LEVEL_MAP = Object.fromEntries(
  CARE_LEVELS.map((c) => [c.value, c.label])
);

export const MOBILITY_LEVELS = [
  { value: "INDEPENDENT", label: "자립", description: "혼자 이동 가능" },
  { value: "PARTIALLY_DEPENDENT", label: "부분의존", description: "보조기구/도움 필요" },
  { value: "FULLY_DEPENDENT", label: "완전의존", description: "이동 시 전적 도움 필요" },
  { value: "BEDRIDDEN", label: "와상", description: "침상 생활" },
] as const;

export const DISEASES = [
  { value: "DEMENTIA", label: "치매" },
  { value: "STROKE", label: "뇌졸중" },
  { value: "PARKINSON", label: "파킨슨병" },
  { value: "ARTHRITIS", label: "관절질환" },
  { value: "DIABETES", label: "당뇨" },
  { value: "HYPERTENSION", label: "고혈압" },
  { value: "HEART_DISEASE", label: "심장질환" },
  { value: "CANCER", label: "암" },
  { value: "RESPIRATORY", label: "호흡기질환" },
  { value: "FRACTURE", label: "골절" },
  { value: "OTHER", label: "기타" },
] as const;

export const SPECIALTIES = [
  { value: "DEMENTIA_SPECIALIST", label: "치매 전문" },
  { value: "STROKE_REHAB", label: "뇌졸중 재활" },
  { value: "PARKINSON_CARE", label: "파킨슨 케어" },
  { value: "BEDRIDDEN_CARE", label: "와상 환자 케어" },
  { value: "HOSPICE", label: "호스피스" },
  { value: "HOSPITAL_CARE", label: "병원 간병" },
  { value: "NIGHT_CARE", label: "야간 돌봄" },
  { value: "MALE_CARE", label: "남성 어르신 전문" },
  { value: "REHAB_SUPPORT", label: "재활 보조" },
] as const;

export const CERTIFICATE_TYPES = [
  { value: "CARE_WORKER_LICENSE", label: "요양보호사 자격증" },
  { value: "NURSING_AIDE_LICENSE", label: "간호조무사 면허" },
  { value: "SOCIAL_WORKER_LICENSE", label: "사회복지사 자격증" },
  { value: "NURSE_LICENSE", label: "간호사 면허" },
  { value: "FIRST_AID", label: "응급처치 자격증" },
  { value: "DEMENTIA_EDUCATION", label: "치매전문교육 이수" },
  { value: "ELDERLY_PSYCHOLOGY", label: "노인심리상담사" },
  { value: "HEALTH_CHECK", label: "건강진단서" },
  { value: "CRIMINAL_CHECK", label: "범죄경력조회서" },
] as const;

export const REGIONS = [
  {
    label: "서울",
    districts: [
      "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구",
      "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구",
      "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구",
      "은평구", "종로구", "중구", "중랑구",
    ],
  },
  {
    label: "경기",
    districts: [
      "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시",
      "남양주시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안양시",
      "양주시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시",
      "하남시", "화성시",
    ],
  },
  {
    label: "인천",
    districts: ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구"],
  },
  {
    label: "부산",
    districts: [
      "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구",
      "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구",
      "중구", "해운대구",
    ],
  },
] as const;

export const DAYS_OF_WEEK = [
  { value: "MON", label: "월" },
  { value: "TUE", label: "화" },
  { value: "WED", label: "수" },
  { value: "THU", label: "목" },
  { value: "FRI", label: "금" },
  { value: "SAT", label: "토" },
  { value: "SUN", label: "일" },
] as const;

export const MATCH_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "상담 대기", color: "bg-yellow-100 text-yellow-800" },
  ACCEPTED: { label: "상담 수락", color: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "거절됨", color: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "계약 확정", color: "bg-green-100 text-green-800" },
  IN_PROGRESS: { label: "돌봄 진행 중", color: "bg-cyan-100 text-cyan-800" },
  COMPLETED: { label: "돌봄 완료", color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "취소됨", color: "bg-gray-100 text-gray-500" },
};

export const CARE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "예정", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "진행 중", color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-800" },
};
