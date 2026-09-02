import type { Metadata } from 'next';
import './globals.css';
import './globals-additions.css';

export const metadata: Metadata = {
  title: 'SH Portal | 성현회계법인',
  description: 'AI와 함께 일하는 성현회계법인의 디지털 업무 포털 디자인 시안'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
