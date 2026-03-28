import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import ToastProvider from "@/providers/ToastProvider";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "CareB(케어비) - 신뢰할 수 있는 요양보호사 매칭 플랫폼",
  description: "믿을 수 있는 요양보호사와 보호자를 연결하는 신뢰할 수 있는 노인돌봄 플랫폼",
  icons: {
    icon: "/favicon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "CareB(케어비) - 어르신의 내일을, 믿음으로 잇다",
    description: "믿을 수 있는 요양보호사와 보호자를 연결하는 신뢰할 수 있는 노인돌봄 플랫폼",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
