import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Travel-Fit AI - 여행 마케터를 위한 AI 이미지 생성기',
  description: '복잡한 설정 없이 브랜드에 맞는 고퀄리티 여행 이미지를 1분 만에 생성하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

