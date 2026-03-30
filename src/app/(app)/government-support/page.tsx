import BackHeader from "@/components/layout/BackHeader";
import { ExternalLink, Banknote, HeartHandshake, Brain, Briefcase, Receipt, Building2 } from "lucide-react";

const SUPPORT_ITEMS = [
  {
    icon: Banknote,
    color: "bg-blue-50 text-blue-500",
    title: "장기요양급여",
    target: "장기요양등급 1~5등급 판정을 받은 어르신",
    content: "등급별 재가급여(방문요양, 방문목욕, 방문간호, 주야간보호 등) 및 시설급여를 지원받을 수 있습니다. 본인부담금은 재가 15%, 시설 20%입니다.",
    howToApply: "국민건강보험공단 지사 방문 또는 온라인(www.longtermcare.or.kr) 신청",
    link: "https://www.longtermcare.or.kr",
  },
  {
    icon: HeartHandshake,
    color: "bg-green-50 text-green-500",
    title: "노인맞춤돌봄서비스",
    target: "만 65세 이상 기초생활수급자, 차상위계층 또는 기초연금수급자 중 독거·조손가구 어르신",
    content: "안전 확인, 생활지원, 사회참여, 일상생활 지원 서비스를 무료 또는 저렴한 비용으로 이용할 수 있습니다.",
    howToApply: "주소지 읍/면/동 주민센터 방문 신청",
    link: "https://www.bokjiro.go.kr",
  },
  {
    icon: Brain,
    color: "bg-purple-50 text-purple-500",
    title: "치매공공후견 지원",
    target: "치매 진단을 받은 의사결정 능력이 부족한 어르신",
    content: "법원이 선임한 후견인이 재산관리, 의료결정 등을 대리하여 치매 어르신의 권익을 보호합니다. 후견인 보수 등 비용을 지원합니다.",
    howToApply: "중앙치매센터(1899-9988) 또는 지역치매안심센터 상담",
    link: "https://www.nid.or.kr",
  },
  {
    icon: Briefcase,
    color: "bg-yellow-50 text-yellow-600",
    title: "노인일자리 연계",
    target: "만 60세 이상(사업별 상이) 취업 희망 어르신",
    content: "공익활동, 사회서비스형, 시장형 등 다양한 유형의 일자리에 참여할 수 있습니다. 월 최대 27만원~71만원의 활동비를 지급합니다.",
    howToApply: "한국노인인력개발원(www.kordi.go.kr) 또는 시니어클럽, 대한노인회 지회 문의",
    link: "https://www.kordi.go.kr",
  },
  {
    icon: Receipt,
    color: "bg-teal-50 text-teal-500",
    title: "간병인 비용 세액공제",
    target: "간병비를 지출한 근로소득자 또는 종합소득 신고자",
    content: "의료비 세액공제 항목으로 간병인 비용(의료기관 발행 영수증 기준)의 15%를 세액공제 받을 수 있습니다. 연간 700만원 한도입니다.",
    howToApply: "연말정산 시 의료비 세액공제 항목에 간병비 영수증 제출",
    link: "https://www.hometax.go.kr",
  },
  {
    icon: Building2,
    color: "bg-orange-50 text-orange-500",
    title: "지자체별 추가 지원",
    target: "각 지자체 거주 주민 (조건 상이)",
    content: "서울시 어르신돌봄종사자 수당, 경기도 치매 가족 휴가제, 부산시 방문요양 추가지원 등 지자체별로 다양한 추가 지원 사업이 운영됩니다.",
    howToApply: "거주지 구청/시청 복지과 문의 또는 복지로(www.bokjiro.go.kr) 검색",
    link: "https://www.bokjiro.go.kr",
  },
];

export default function GovernmentSupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="정부지원금 안내" fallbackHref="/home" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-5">
        <h2 className="text-white text-lg font-black">돌봄 관련 정부지원금</h2>
        <p className="text-blue-100 text-sm mt-1 leading-relaxed">
          어르신 돌봄에 활용할 수 있는 정부지원 제도를 안내해드립니다.
        </p>
      </div>

      {/* Support Items */}
      <div className="px-4 py-4 space-y-3">
        {SUPPORT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-900">{item.title}</h3>
                  <p className="text-xs text-primary-500 mt-0.5">{item.target}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-3">{item.content}</p>

              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">신청 방법</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.howToApply}</p>
              </div>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={14} />
                자세히 보기
              </a>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mx-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-xs text-yellow-700 leading-relaxed">
          <strong>참고:</strong> 위 정보는 2026년 3월 기준이며, 지원 조건 및 금액은 변경될 수 있습니다.
          정확한 정보는 해당 기관에 직접 문의해주세요.
        </p>
      </div>
    </div>
  );
}
