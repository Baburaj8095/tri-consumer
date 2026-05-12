import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineBuildingOffice2, 
  HiOutlineTruck, 
  HiOutlineGlobeAlt, 
  HiOutlineDocumentText 
} from 'react-icons/hi2';

const actions = [
  {
    id: 1,
    title: 'Free Zone Shopping',
    icon: HiOutlineBuildingOffice2,
    color: '#8b5cf6', // Violet
    bg: '#f5f3ff',
    link: '/consumer-ecommerce'
  },
  {
    id: 2,
    title: 'Free Delivery Track',
    icon: HiOutlineTruck,
    color: '#0ea5e9', // Sky Blue
    bg: '#f0f9ff',
    link: '/consumer-ecommerce/delivery'
  },
  {
    id: 3,
    title: 'Online Shopping',
    icon: HiOutlineGlobeAlt,
    color: '#f59e0b', // Amber
    bg: '#fffbeb',
    link: '/consumer-ecommerce/delivery'
  },
  {
    id: 4,
    title: 'Private Delivery Track',
    icon: HiOutlineDocumentText,
    color: '#10b981', // Emerald
    bg: '#ecfdf5',
    link: '/consumer-ecommerce/delivery'
  }
];

export default function ActionGrid() {
  return (
    <section className="ce-content-section" style={{ padding: '16px 14px' }}>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px' 
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.id}
              to={action.link}
              className="ce-action-grid-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
                borderRadius: '24px',
                padding: '20px 16px',
                textDecoration: 'none',
                boxShadow: '8px 8px 16px #e2e8f0, -8px -8px 16px #ffffff',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                minHeight: '120px'
              }}
            >
              <div 
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '14px', 
                  background: action.bg, 
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: `0 4px 10px ${action.color}40`
                }}
              >
                <Icon />
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ce-text)', lineHeight: '1.2', display: 'block' }}>
                  {action.title}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ce-muted)', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                  Tap to open
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
