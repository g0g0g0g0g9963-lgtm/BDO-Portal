'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';

type MenuItem = { icon: string; label: string; count?: string };
type MenuGroup = { label: 'MAIN' | 'WORKSPACE' | 'FIRM'; items: MenuItem[] };
type MenuCategory = 'ALL' | MenuGroup['label'];
type CatalogMenuItem = MenuItem & { group: MenuGroup['label'] };

const menuGroups: MenuGroup[] = [
  {
    label: 'MAIN',
    items: [
      { icon: '🏠', label: '대시보드' },
      { icon: '📘', label: 'SH Audit Platform' },
      { icon: '📊', label: 'IFRS 1118호 분석기' },
      { icon: '🏛️', label: '금융기관 조회' },
      { icon: '🧬', label: 'XBRL Comparator' },
      { icon: '▦', label: 'App 그리드', count: '10' },
      { icon: '📁', label: '내 프로젝트', count: '12' },
      { icon: '✚', label: '새 프로젝트' }
    ]
  },
  {
    label: 'WORKSPACE',
    items: [
      { icon: '🖥️', label: 'ERP' },
      { icon: '◔', label: 'AQI 지표' },
      { icon: '📚', label: '지식 라이브러리' }
    ]
  },
  {
    label: 'FIRM',
    items: [
      { icon: '📜', label: '규정·지침' },
      { icon: '📣', label: '공지사항' },
      { icon: '📅', label: '일정' },
      { icon: '⚙️', label: '설정' }
    ]
  }
];

const CATALOG_MENU_ITEMS: CatalogMenuItem[] = menuGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label }))
);
const CUSTOMIZABLE_MENU_ITEMS = CATALOG_MENU_ITEMS.filter((item) => item.label !== '대시보드');
const WORKSPACE_ITEMS = menuGroups[1].items;
const FIRM_ITEMS = menuGroups[2].items;
const DEFAULT_VISIBLE_MENUS = ['SH Audit Platform', 'IFRS 1118호 분석기', '금융기관 조회', 'XBRL Comparator'];
const VISIBLE_MENU_KEY = 'sh-portal-visible-menu-v3';

const kpis = [
  { icon: '▣', tone: 'blue', label: '진행 중 감사', value: '12', sub: '▲ 전월 대비 +2건' },
  { icon: '▤', tone: 'green', label: '리뷰 대기 조서', value: '47', sub: '▼ 전주 대비 -8건' },
  { icon: '△', tone: 'red', label: '마감 임박 (7일내)', value: '3', sub: '주의 필요' },
  { icon: '↗', tone: 'orange', label: 'AQI 지수', value: '92.4', sub: 'ISQM1 기준 충족 · 상세 보기' }
];

const projects = [
  { key: 'A', name: '㈜알파테크 제25기 외부감사', standard: 'K-IFRS', closing: '12월 결산', owner: '김회계', progress: 72, state: '현장수행', tone: 'orange' },
  { key: 'B', name: '㈜베타홀딩스 연결감사', standard: 'K-IFRS', closing: '12월 결산', owner: '박회계', progress: 91, state: '리뷰', tone: 'blue' },
  { key: 'C', name: '㈜감마물산 제18기 감사', standard: '일반기준', closing: '12월 결산', owner: '이회계', progress: 45, state: '현장수행', tone: 'orange' },
  { key: 'D', name: '㈜델타에너지 기말감사', standard: 'K-IFRS', closing: '12월 결산', owner: '최회계', progress: 100, state: '완료', tone: 'green' }
];

const notices = [
  { title: 'ISQM1 2026년 품질관리 보고서 작성 안내', meta: '품질관리본부 · 04/03', urgent: true },
  { title: 'SH Audit Platform 회사 기초정보 기능 오픈', meta: 'AX 추진위 · 04/02', urgent: false },
  { title: '4월 정기 파트너 월례회의 (15일 14시)', meta: '경영지원실 · 04/01', urgent: false },
  { title: '삼일 TAX Agent 법인 구독 완료', meta: 'AX 추진위 · 03/28', urgent: false }
];

function BdoLogo() {
  return (
    <div className="dash-brand-lockup" aria-label="BDO Korea">
      <img className="dash-bdo-logo" src="/bdo-logo-color.png" alt="" aria-hidden="true" />
      <span className="dash-country-label">KOREA</span>
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState('대시보드');
  const [query, setQuery] = useState('');
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [noticePaused, setNoticePaused] = useState(false);
  const [isMenuEditing, setIsMenuEditing] = useState(false);
  const [visibleMenuLabels, setVisibleMenuLabels] = useState(DEFAULT_VISIBLE_MENUS);
  const [draftMenuLabels, setDraftMenuLabels] = useState(DEFAULT_VISIBLE_MENUS);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState<MenuCategory>('ALL');
  const [draggedMenu, setDraggedMenu] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VISIBLE_MENU_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const validLabels = parsed.filter((label) => CUSTOMIZABLE_MENU_ITEMS.some((item) => item.label === label));
        setVisibleMenuLabels(validLabels);
      }
    } catch {
      window.localStorage.removeItem(VISIBLE_MENU_KEY);
    }
  }, []);

  useEffect(() => {
    if (noticePaused) return;
    const timer = window.setInterval(() => {
      setNoticeIndex((current) => (current + 1) % notices.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [noticePaused]);

  useEffect(() => {
    if (!isMenuEditing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuEditing(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuEditing]);

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) => (
      `${project.name} ${project.standard} ${project.closing} ${project.owner}`.toLowerCase().includes(normalized)
    ));
  }, [query]);

  const visibleMenuItems = useMemo(() => visibleMenuLabels
    .map((label) => CUSTOMIZABLE_MENU_ITEMS.find((item) => item.label === label))
    .filter((item): item is MenuItem => Boolean(item)), [visibleMenuLabels]);

  const draftMenuItems = useMemo(() => draftMenuLabels
    .map((label) => CUSTOMIZABLE_MENU_ITEMS.find((item) => item.label === label))
    .filter((item): item is CatalogMenuItem => Boolean(item)), [draftMenuLabels]);

  const filteredCatalogItems = useMemo(() => {
    const normalized = menuSearch.trim().toLowerCase();
    return CATALOG_MENU_ITEMS.filter((item) => (
      (menuCategory === 'ALL' || item.group === menuCategory)
      && (!normalized || `${item.label} ${item.group}`.toLowerCase().includes(normalized))
    ));
  }, [menuCategory, menuSearch]);

  const moveNotice = (step: number) => {
    setNoticeIndex((current) => (current + step + notices.length) % notices.length);
  };

  const currentNotice = notices[noticeIndex];

  const saveVisibleMenus = (next: string[]) => {
    const normalized = next.filter((label, index) => (
      CUSTOMIZABLE_MENU_ITEMS.some((item) => item.label === label) && next.indexOf(label) === index
    ));
    setVisibleMenuLabels(normalized);
    window.localStorage.setItem(VISIBLE_MENU_KEY, JSON.stringify(normalized));
  };

  const openMenuEditor = () => {
    setDraftMenuLabels(visibleMenuLabels);
    setMenuSearch('');
    setMenuCategory('ALL');
    setDraggedMenu(null);
    setIsMenuEditing(true);
  };

  const closeMenuEditor = () => {
    setDraftMenuLabels(visibleMenuLabels);
    setDraggedMenu(null);
    setIsMenuEditing(false);
  };

  const applyMenuEditor = () => {
    saveVisibleMenus(draftMenuLabels);
    if (active !== '대시보드' && !draftMenuLabels.includes(active)) setActive('대시보드');
    setIsMenuEditing(false);
  };

  const handleMenuDrop = (event: DragEvent<HTMLElement>, targetLabel: string) => {
    event.preventDefault();
    const sourceLabel = event.dataTransfer.getData('text/plain') || draggedMenu;
    if (!sourceLabel || sourceLabel === targetLabel) return;
    const labels = [...draftMenuLabels];
    const fromIndex = labels.indexOf(sourceLabel);
    const toIndex = labels.indexOf(targetLabel);
    if (fromIndex < 0 || toIndex < 0) return;
    labels.splice(toIndex, 0, labels.splice(fromIndex, 1)[0]);
    setDraftMenuLabels(labels);
    setDraggedMenu(null);
  };

  const resetMenuOrder = () => {
    setDraftMenuLabels(DEFAULT_VISIBLE_MENUS);
    setDraggedMenu(null);
  };

  const moveMenuItem = (label: string, direction: -1 | 1) => {
    const labels = [...draftMenuLabels];
    const currentIndex = labels.indexOf(label);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= labels.length) return;
    labels.splice(nextIndex, 0, labels.splice(currentIndex, 1)[0]);
    setDraftMenuLabels(labels);
  };

  const addMenuItem = (label: string) => {
    if (label === '대시보드' || draftMenuLabels.includes(label) || draftMenuLabels.length >= 4) return;
    setDraftMenuLabels([...draftMenuLabels, label]);
  };

  const removeMenuItem = (label: string) => {
    setDraftMenuLabels(draftMenuLabels.filter((item) => item !== label));
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <button className="topbar-brand" type="button" onClick={() => router.push('/')} aria-label="로그인 화면으로 이동">
          <BdoLogo />
        </button>

        <label className="global-search">
          <span className="search-symbol" aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사명·조서·규정·판례를 한 번에 검색…" aria-label="통합 검색" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기">×</button>}
        </label>

        <div className="topbar-actions">
          <button className="notification-button" type="button" aria-label="알림 3개"><BellIcon /><b>3</b></button>
          <span className="topbar-avatar">윤</span>
          <span className="topbar-user"><strong>윤길배 CPA</strong><small>대표이사 · Partner</small></span>
        </div>
      </header>

      <section
        className="notice-carousel"
        aria-label="법인 공지"
        aria-live="polite"
        onMouseEnter={() => setNoticePaused(true)}
        onMouseLeave={() => setNoticePaused(false)}
        onFocus={() => setNoticePaused(true)}
        onBlur={() => setNoticePaused(false)}
      >
        <strong className="notice-label">법인 공지</strong>
        <span className={`notice-dot ${currentNotice.urgent ? 'urgent' : ''}`} aria-hidden="true" />
        <span className="notice-title" key={currentNotice.title}>{currentNotice.title}</span>
        <span className="notice-meta">{currentNotice.meta}</span>
        <div className="notice-controls">
          <button type="button" onClick={() => moveNotice(-1)} aria-label="이전 공지">‹</button>
          <span>{noticeIndex + 1} / {notices.length}</span>
          <button type="button" onClick={() => moveNotice(1)} aria-label="다음 공지">›</button>
        </div>
      </section>

      <div className="dashboard-body">
        <aside className="app-launcher">
          <header className="launcher-toolbar">
            <span><strong>나의 업무 메뉴</strong><small>대시보드와 자주 쓰는 메뉴를 한눈에 확인하세요.</small></span>
            <div>
              <button className="launcher-edit" type="button" onClick={openMenuEditor}>메뉴 편집</button>
            </div>
          </header>
          <nav aria-label="포털 메뉴">
            <section className="personal-menu-section">
              <h2>MY SHORTCUTS <span>{visibleMenuItems.length}</span></h2>
              <div className="personal-menu-list">
                {visibleMenuItems.map(({ icon, label, count }) => (
                  <div className="launcher-item" key={label}>
                    <button
                      type="button"
                      title={label}
                      className={`launcher-menu-button ${active === label ? 'active' : ''}`}
                      onClick={() => setActive(label)}
                    >
                      <span className="launcher-icon" aria-hidden="true">{icon}</span>
                      <span className="launcher-text">{label}</span>
                      {count && <span className="launcher-badge">{count}</span>}
                      <span className="launcher-arrow" aria-hidden="true">›</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>


            <section className="launcher-group launcher-workspace fixed-launcher-group">
              <h2>WORKSPACE</h2>
              <div className="launcher-items">
                {WORKSPACE_ITEMS.map(({ icon, label, count }) => (
                  <button key={label} type="button" className={`launcher-menu-button ${active === label ? 'active' : ''}`} onClick={() => setActive(label)}>
                    <span className="launcher-icon" aria-hidden="true">{icon}</span>
                    <span className="launcher-text">{label}</span>
                    {count && <span className="launcher-badge">{count}</span>}
                    <span className="launcher-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="launcher-group launcher-firm fixed-launcher-group">
              <h2>FIRM</h2>
              <div className="launcher-items">
                {FIRM_ITEMS.map(({ icon, label }) => (
                  <button key={label} type="button" className={`launcher-menu-button ${active === label ? 'active' : ''}`} onClick={() => setActive(label)}>
                    <span className="launcher-icon" aria-hidden="true">{icon}</span>
                    <span className="launcher-text">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </nav>
        </aside>

        <section className="dashboard-workspace">
          <header className="workspace-heading">
            <p>윤길배 대표이사님,</p>
            <h1>오늘 성현은 <strong>12건</strong>의 프로젝트가 진행 중입니다.</h1>
          </header>

          <section className="kpi-flow" aria-label="핵심 업무 지표">
            {kpis.map((item) => (
              <article key={item.label} className={`kpi-item ${item.tone}`}>
                <span className={`kpi-icon ${item.tone}`} aria-hidden="true">{item.icon}</span>
                <span className="kpi-copy"><small>{item.label}</small><strong>{item.value}</strong><em className={item.tone}>{item.sub}</em></span>
              </article>
            ))}
          </section>

          <section className="project-panel">
            <header className="panel-heading">
              <span><h2>진행 중 감사 프로젝트</h2><b>LIVE</b></span>
              <button type="button">전체 프로젝트 보기　›</button>
            </header>

            <div className="project-table" role="table" aria-label="진행 중 감사 프로젝트">
              <div className="project-table-head" role="row">
                <span>프로젝트</span><span>기준</span><span>결산</span><span>인차지</span><span>프로젝트 진행률</span><span>상태</span><span />
              </div>
              <div className="project-list">
                {filteredProjects.length ? filteredProjects.map((project) => (
                  <article key={project.key} className="project-row" role="row">
                    <span className="project-summary"><b className="project-key">{project.key}</b><span><strong>{project.name}</strong><small>{project.standard}　|　{project.closing}　|　인차지 {project.owner}</small></span></span>
                    <span className="project-cell">{project.standard}</span>
                    <span className="project-cell">{project.closing}</span>
                    <span className="project-cell">{project.owner}</span>
                    <span className="progress-area"><span className="progress-track"><i style={{ width: `${project.progress}%` }} /></span><small>{project.progress}%</small></span>
                    <span className={`project-state ${project.tone}`}>{project.state}</span>
                    <button className="project-open" type="button" aria-label={`${project.name} 열기`}>›</button>
                  </article>
                )) : <div className="empty-result">검색 결과가 없습니다.</div>}
              </div>
            </div>
          </section>
        </section>
      </div>

      {isMenuEditing && (
        <div className="menu-editor-overlay" onMouseDown={closeMenuEditor}>
          <section
            className="menu-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="menu-editor-header">
              <span>
                <small>MY WORKSPACE</small>
                <h2 id="menu-editor-title">나의 업무 메뉴 편집</h2>
                <p>자주 쓰는 앱 4개를 고르고 원하는 순서로 배치해 보세요.</p>
              </span>
              <button type="button" onClick={closeMenuEditor} aria-label="메뉴 편집 닫기">×</button>
            </header>

            <div className="menu-editor-columns">
              <section className="menu-current-column" aria-labelledby="current-menu-title">
                <header>
                  <span><h3 id="current-menu-title">현재 표시 메뉴</h3><p>드래그하거나 화살표로 순서를 바꿀 수 있어요.</p></span>
                  <b>{draftMenuItems.length}<i>/4</i></b>
                </header>
                <div className="menu-current-list">
                  {draftMenuItems.map(({ icon, label, group }, index) => (
                    <article
                      key={label}
                      draggable
                      className={draggedMenu === label ? 'dragging' : ''}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', label);
                        setDraggedMenu(label);
                      }}
                      onDragEnd={() => setDraggedMenu(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleMenuDrop(event, label)}
                    >
                      <span className="menu-drag-handle" aria-hidden="true">⠿</span>
                      <span className="menu-current-icon" aria-hidden="true">{icon}</span>
                      <span className="menu-current-copy"><strong>{label}</strong><small>{group}</small></span>
                      <span className="menu-order-controls">
                        <button type="button" disabled={index === 0} onClick={() => moveMenuItem(label, -1)} aria-label={`${label} 위로 이동`}>↑</button>
                        <button type="button" disabled={index === draftMenuItems.length - 1} onClick={() => moveMenuItem(label, 1)} aria-label={`${label} 아래로 이동`}>↓</button>
                      </span>
                      <button className="menu-remove-button" type="button" onClick={() => removeMenuItem(label)} aria-label={`${label} 메뉴 삭제`}>×</button>
                    </article>
                  ))}
                  {!draftMenuItems.length && <div className="menu-empty-state"><strong>표시할 메뉴를 선택해 주세요.</strong><span>오른쪽 전체 앱에서 최대 4개까지 추가할 수 있습니다.</span></div>}
                </div>
                <button className="menu-editor-reset" type="button" onClick={resetMenuOrder}>기본 메뉴로 초기화</button>
              </section>

              <section className="menu-catalog-column" aria-labelledby="catalog-menu-title">
                <header className="menu-catalog-heading">
                  <span><h3 id="catalog-menu-title">전체 앱</h3><p>현재 포털에서 사용할 수 있는 앱을 모두 확인하세요.</p></span>
                  <label className="menu-app-search">
                    <span aria-hidden="true">⌕</span>
                    <input value={menuSearch} onChange={(event) => setMenuSearch(event.target.value)} placeholder="앱 이름 검색" aria-label="앱 이름 검색" />
                  </label>
                </header>
                <div className="menu-category-tabs" role="tablist" aria-label="앱 분류">
                  {(['ALL', 'MAIN', 'WORKSPACE', 'FIRM'] as MenuCategory[]).map((category) => (
                    <button key={category} type="button" className={menuCategory === category ? 'active' : ''} onClick={() => setMenuCategory(category)}>{category === 'ALL' ? '전체' : category}</button>
                  ))}
                </div>
                <div className="menu-catalog-grid">
                  {filteredCatalogItems.map((item) => {
                    const isSelected = draftMenuLabels.includes(item.label);
                    const isDashboard = item.label === '대시보드';
                    const isFull = draftMenuLabels.length >= 4;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        className={isSelected ? 'selected' : ''}
                        disabled={isDashboard || (!isSelected && isFull)}
                        onClick={() => !isSelected && addMenuItem(item.label)}
                        aria-label={isDashboard ? '대시보드는 기본 화면입니다' : isSelected ? `${item.label} 추가됨` : `${item.label} 메뉴 추가`}
                      >
                        <span className="menu-catalog-icon" aria-hidden="true">{item.icon}</span>
                        <span className="menu-catalog-copy"><strong>{item.label}</strong><small>{item.group}</small></span>
                        <em>{isDashboard ? '기본' : isSelected ? '추가됨' : '＋'}</em>
                      </button>
                    );
                  })}
                  {!filteredCatalogItems.length && <p className="menu-catalog-empty">검색 결과가 없습니다.</p>}
                </div>
              </section>
            </div>

            <footer className="menu-editor-footer">
              <p><span aria-hidden="true">✓</span> 적용한 메뉴는 이 기기에 안전하게 저장됩니다.</p>
              <div>
                <button className="menu-editor-cancel" type="button" onClick={closeMenuEditor}>취소</button>
                <button className="menu-editor-apply" type="button" onClick={applyMenuEditor}>메뉴 적용</button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
