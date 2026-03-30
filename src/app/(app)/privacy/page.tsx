import BackHeader from "@/components/layout/BackHeader";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="개인정보처리방침" fallbackHref="/my" />
      <div className="px-4 py-6 bg-white mx-0 mt-2">
        <h2 className="text-base font-bold text-gray-900 mb-4">개인정보처리방침</h2>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">1. 개인정보의 처리 목적</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            CareB(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.<br />
            수집된 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.<br /><br />
            가. 회원 가입 및 관리<br />
            나. 돌봄 매칭 서비스 제공<br />
            다. 민원 처리<br />
            라. 서비스 개선 및 통계
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">2. 처리하는 개인정보의 항목</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            회사는 다음의 개인정보 항목을 처리하고 있습니다.<br /><br />
            <span className="font-medium">필수항목:</span><br />
            - 이름, 연락처, 이메일 주소<br />
            - 프로필 사진 (선택)<br />
            - 지역 정보<br /><br />
            <span className="font-medium">요양보호사 추가 항목:</span><br />
            - 자격증 번호, 경력, 서비스 종류
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">3. 개인정보의 처리 및 보유 기간</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
            동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.<br /><br />
            - 회원 탈퇴 시 즉시 삭제 (단, 관계 법령에 따라 일정 기간 보관할 수 있음)<br />
            - 전자상거래 관련 기록: 5년<br />
            - 소비자 불만 또는 분쟁처리 기록: 3년
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">4. 개인정보의 제3자 제공</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며,
            정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만
            개인정보를 제3자에게 제공합니다.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">5. 정보주체의 권리·의무 및 행사방법</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의
            권리를 행사할 수 있습니다.<br /><br />
            고객센터: 1588-0000<br />
            이메일: privacy@bayada.kr
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">6. 개인정보 보호책임자</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 정보주체의 불만처리 및
            피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.<br /><br />
            개인정보 보호책임자<br />
            이메일: privacy@bayada.kr
          </p>
        </section>

        <div className="mt-8 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            본 방침은 법무팀 검토 후 최종 확정될 예정입니다.<br />
            시행일: 추후 공지
          </p>
        </div>
      </div>
    </div>
  );
}
