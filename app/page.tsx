'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const methods = [
  { id: 'google', label: 'Google Workspace로 로그인' },
  { id: 'microsoft', label: 'Microsoft 365로 로그인' },
  { id: 'employee', label: '사원번호로 로그인' }
];

const features = [
  ['shield', '구성원 전용 SSO 인증, 2단계 보안'],
  ['folder', '프로젝트·조사·ERP·외부 App 통합 진입'],
  ['ai', '업무 전반을 돕는 AI Assistant']
];

function BdoLogo({ korea = false }: { korea?: boolean }) {
  if (korea) {
    return (
      <div className="brand-korea-lockup" aria-label="BDO Korea">
        <img className="brand-korea-logo" src="/bdo-logo-color.png" alt="" aria-hidden="true" />
        <span className="brand-korea-label">KOREA</span>
      </div>
    );
  }

  return (
    <div className="brand-lockup" aria-label="BDO Member Firm">
      <div className="bdo-mark" aria-hidden="true"><span>BDO</span></div>
      <span className="brand-divider" aria-hidden="true" />
      <div className="member-copy"><strong>MEMBER FIRM</strong><span>People Helping People Achieve Their Dreams</span></div>
    </div>
  );
}

function FeatureIcon({ type }: { type: string }) {
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 19 6v5.2c0 4.4-2.9 7.6-7 9.3-4.1-1.7-7-4.9-7-9.3V6l7-2.5Z" />
        <path d="m9.1 12 1.9 1.9 4-4.2" />
      </svg>
    );
  }
  if (type === 'folder') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.8 7.3h6l1.7 2h8.7v8.8c0 1-.8 1.8-1.8 1.8H5.6c-1 0-1.8-.8-1.8-1.8V7.3Z" />
        <path d="M3.8 7.3V5.9c0-1 .8-1.8 1.8-1.8h4l2 2h6.8c1 0 1.8.8 1.8 1.8v1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.6v3.1M12 17.3v3.1M3.6 12h3.1M17.3 12h3.1" />
      <path d="m6.1 6.1 2.2 2.2M15.7 15.7l2.2 2.2M17.9 6.1l-2.2 2.2M8.3 15.7l-2.2 2.2" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function ProviderIcon({ id }: { id: string }) {
  if (id === 'google') return <span className="google-icon" aria-hidden="true">G</span>;
  if (id === 'microsoft') return <span className="microsoft-icon" aria-hidden="true"><i /><i /><i /><i /></span>;
  return <span className="employee-icon" aria-hidden="true">ID</span>;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') === 'bright' ? 'bright' : 'dark';
  const [notice, setNotice] = useState<string | null>(null);
  const portalClicks = useRef(0);
  const resetTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  const showDemoNotice = (label: string) => setNotice(`${label} — 디자인 시안용 화면입니다. 실제 계정과 연결되지 않았습니다.`);

  const openPortal = () => {
    portalClicks.current += 1;
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    if (portalClicks.current >= 5) {
      portalClicks.current = 0;
      router.push('/dashboard');
      return;
    }
    resetTimer.current = window.setTimeout(() => { portalClicks.current = 0; }, 2200);
  };

  return (
    <main className={`portal-shell theme-${theme}`}>
      <div className="scene-overlay" aria-hidden="true" />
      <div className="right-focus-overlay" aria-hidden="true" />
      <section className="intro-panel" aria-labelledby="hero-title">
        <BdoLogo korea={theme === 'bright'} />
        <div className="hero-copy">
          <p className="eyebrow">SEONGHYUN CPAs · AX</p>
          <h1 id="hero-title">AI와 함께 일하는<br />회계법인, <em>성현.</em></h1>
          <p className="hero-description">
            감사·세무·자문 업무가 하나의 포털 위에서 흐르고, 개인의 경험이<br className="desktop-break" />
            법인의 데이터로 축적되며, AI가 언제나 동료로 곁에 있는 디지털 운영체제 —<br className="desktop-break" />
            SH Portal에 오신 것을 환영합니다.
          </p>
        </div>
        <ul className="feature-list" aria-label="포털 주요 특징">
          {features.map(([icon, label]) => (
            <li key={icon}><span className="feature-icon"><FeatureIcon type={icon} /></span><span>{label}</span></li>
          ))}
        </ul>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <header className="login-brand">
          <div className="portal-title-row">
            <button className="orange-dot portal-entry-dot" type="button" onClick={openPortal} aria-label="SH Portal 열기" />
            <span>SH Portal</span>
          </div>
          <p>성현회계법인 업무 포털</p>
        </header>
        <div className="login-copy">
          <h2 id="login-title">통합 계정으로 로그인</h2><span className="title-accent" aria-hidden="true" />
          <p>하나의 계정으로 모든 업무 서비스를 이용하세요.</p>
        </div>
        <div className="login-actions">
          {methods.slice(0, 2).map((method) => (
            <button key={method.id} type="button" onClick={() => showDemoNotice(method.label)}>
              <span className="provider-well"><ProviderIcon id={method.id} /></span>
              <span className="button-label">{method.label}</span><span className="chevron" aria-hidden="true">›</span>
            </button>
          ))}
          <div className="or-divider" aria-hidden="true"><span /><b>또는</b><span /></div>
          <button type="button" onClick={() => showDemoNotice(methods[2].label)}>
            <span className="provider-well"><ProviderIcon id="employee" /></span>
            <span className="button-label">사원번호로 로그인</span><span className="chevron" aria-hidden="true">›</span>
          </button>
        </div>
        <footer className="login-footer">
          <span className="security-status"><i aria-hidden="true">✓</i> 보안 연결 · 2단계 인증 적용</span>
          <button type="button" onClick={() => setNotice('관리자 문의 및 비밀번호 재설정은 디자인 시안에서 연결되지 않습니다.')}>관리자 문의 · 비밀번호 재설정</button>
        </footer>
      </section>

      {notice && <div className="demo-notice" role="status" aria-live="polite"><span aria-hidden="true">i</span>{notice}</div>}
    </main>
  );
}




