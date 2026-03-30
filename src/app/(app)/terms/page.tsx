import BackHeader from "@/components/layout/BackHeader";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="이용약관" fallbackHref="/my" />
      <div className="px-4 py-6 bg-white mx-0 mt-2">
        <h2 className="text-base font-bold text-gray-900 mb-4">CareB 서비스 이용약관</h2>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제1조 (목적)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            본 약관은 CareB(이하 "회사")가 제공하는 돌봄 매칭 서비스(이하 "서비스")의 이용과 관련하여
            회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제2조 (용어의 정의)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            1. "서비스"란 회사가 제공하는 돌봄 매칭 플랫폼 및 관련 부가 서비스를 의미합니다.<br />
            2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br />
            3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제3조 (약관의 효력 및 변경)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.<br />
            2. 회사는 필요한 경우 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.<br />
            3. 약관 변경 시 최소 7일 전에 공지합니다.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제4조 (서비스의 제공)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            회사는 다음과 같은 서비스를 제공합니다.<br />
            1. 돌봄 매칭 서비스<br />
            2. 요양보호사 정보 제공 서비스<br />
            3. 돌봄 일정 관리 서비스<br />
            4. 기타 회사가 정하는 서비스
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제5조 (이용계약의 성립)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용계약은 이용자가 본 약관에 동의하고 회원가입을 완료함으로써 성립됩니다.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">제6조 (이용자의 의무)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용자는 다음 행위를 해서는 안 됩니다.<br />
            1. 타인의 정보 도용<br />
            2. 허위 정보 등록<br />
            3. 서비스 운영 방해<br />
            4. 관련 법령 위반 행위
          </p>
        </section>

        <div className="mt-8 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            본 약관은 법무팀 검토 후 최종 확정될 예정입니다.<br />
            시행일: 추후 공지
          </p>
        </div>
      </div>
    </div>
  );
}
