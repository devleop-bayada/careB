import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-6xl font-black text-primary-500 mb-2">404</h1>
      <h2 className="text-lg font-bold text-gray-900 mb-2">페이지를 찾을 수 없어요</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        요청하신 페이지가 존재하지 않거나<br />이동되었을 수 있어요.
      </p>
      <Link
        href="/"
        className="bg-primary-500 text-white font-bold px-8 py-3 rounded-full text-sm hover:bg-primary-600 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
