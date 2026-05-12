const shortcuts = [
  {
    id: 'tripay',
    label: 'Tripay',
    bg: '#FEF3C7',
    accent: '#F59E0B',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M6 7a2 2 0 0 0-2 2v7.5A2.5 2.5 0 0 0 6.5 19H18a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H6Zm0 2h12v7H6V9Zm2 2.25a.75.75 0 0 1 1.5 0V13h1.5a.75.75 0 0 1 0 1.5H9.5v.75a.75.75 0 0 1-1.5 0V14.5H6.5A.75.75 0 0 1 6.5 13H7.5v-1.75Z"/>
      </svg>
    ),
  },
  {
    id: 'trieat',
    label: 'Tri Eat',
    bg: '#FFE7D9',
    accent: '#F97316',
    badge: 'NEW',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M8 3h2.5a.5.5 0 0 1 .5.5V14a1.5 1.5 0 0 1-3 0V3.5A.5.5 0 0 1 8 3Zm5 0h2.5a.5.5 0 0 1 .5.5V14a1.5 1.5 0 0 1-3 0V3.5a.5.5 0 0 1 .5-.5ZM6 16.5a.5.5 0 0 1 .5-.5H17a.5.5 0 0 1 0 1H6.5a.5.5 0 0 1-.5-.5Z"/>
      </svg>
    ),
  },
  {
    id: 'tridrop',
    label: 'Tri Drop',
    bg: '#DCFCE7',
    accent: '#059669',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M3 16.5V6.75A1.75 1.75 0 0 1 4.75 5h10.5A1.75 1.75 0 0 1 17 6.75V7h1.5A2.5 2.5 0 0 1 21 9.5v6A2.5 2.5 0 0 1 18.5 18H18a3 3 0 1 1-6 0H9a3 3 0 1 1-6 0v-1.5Zm2-8.5v8h10.5V9.5H5Zm13 3.5h1.5a1 1 0 0 0 0-2H18v2Z"/>
      </svg>
    ),
  },
  {
    id: 'tritrip',
    label: 'Tri Trip',
    bg: '#E0E7FF',
    accent: '#4338CA',
    badgeDot: '2',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 2.5a7 7 0 0 0-7 7c0 4.5 7 11.5 7 11.5s7-7 7-11.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
      </svg>
    ),
  },
  {
    id: 'tripayplus',
    label: 'Tri Pay+',
    bg: '#DBEAFE',
    accent: '#2563EB',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 5.5a3.5 3.5 0 1 0 0 7h1.5a.5.5 0 0 1 0 1H12a2.5 2.5 0 1 1 0-5h1.5a.5.5 0 0 1 0 1H12a1.5 1.5 0 1 0 0 3h2a.5.5 0 0 1 0 1H12a2.5 2.5 0 1 1 0-5Z"/>
      </svg>
    ),
  },
  {
    id: 'triwatch',
    label: 'Tri Watch',
    bg: '#FEE2E2',
    accent: '#EF4444',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M5 4.5A2.5 2.5 0 0 0 2.5 7v10A2.5 2.5 0 0 0 5 19.5h14a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 19 4.5H5Zm1.5 3.5l7.5 3.5-7.5 3.5V8Z"/>
      </svg>
    ),
  },
  {
    id: 'recharge',
    label: 'Recharge',
    bg: '#EDE9FE',
    accent: '#8B5CF6',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M7 3.75a.75.75 0 0 0-1.5 0V8H4.5a1.5 1.5 0 0 0 0 3H5v5.75a.75.75 0 0 0 1.5 0V11h1.5a1.5 1.5 0 0 0 0-3H6V3.75Zm8 0a.75.75 0 0 1 1.5 0V8h1.5a1.5 1.5 0 0 1 0 3H17v5.75a.75.75 0 0 1-1.5 0V11h-1.5a1.5 1.5 0 0 1 0-3H15V3.75Z"/>
      </svg>
    ),
  },
  {
    id: 'more',
    label: 'More',
    bg: '#F3F4F6',
    accent: '#6B7280',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <circle cx="12" cy="6" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="18" r="1.5" />
      </svg>
    ),
  },
];

export default function ShortcutGridSection() {
  return (
    <section className="ce-shortcut-grid-section">
      <div className="ce-shortcut-header-row">
        <div>
          <p className="ce-shortcut-title">Your shortcuts</p>
        </div>
        <a href="#" className="ce-shortcut-see-all">See all ›</a>
      </div>

      <div className="ce-shortcut-grid">
        {shortcuts.map((item) => (
          <div key={item.id} className="ce-shortcut-tile">
            <div
              className="ce-shortcut-icon"
              style={{ backgroundColor: item.bg, color: item.accent }}
            >
              {item.icon}
            </div>
            {item.badge && (
              <div className="ce-shortcut-badge-pill">{item.badge}</div>
            )}
            {item.badgeDot && (
              <div className="ce-shortcut-badge-dot">{item.badgeDot}</div>
            )}
            <span className="ce-shortcut-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
