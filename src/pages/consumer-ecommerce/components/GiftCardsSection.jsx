import { Link } from 'react-router-dom';
import { 
  HiOutlineGift, 
  HiOutlineBuildingOffice, 
  HiOutlineDevicePhoneMobile, 
  HiOutlineStar, 
  HiOutlinePlus,
  HiOutlineTv
} from 'react-icons/hi2';

export default function GiftCardsSection() {
  const giftCards = [
    { id: 1, name: 'Trikonekt Gift Card', icon: HiOutlineGift },
    { id: 2, name: 'Reliance', icon: HiOutlineBuildingOffice },
    { id: 3, name: 'Amazon', icon: HiOutlineBuildingOffice },
    { id: 4, name: 'JIO', icon: HiOutlineDevicePhoneMobile },
    { id: 5, name: 'Jio Allstar', icon: HiOutlineStar },
    { id: 6, name: 'Coffee Play', icon: HiOutlineGift },
    { id: 7, name: 'More', icon: HiOutlinePlus },
  ];

  return (
    <section className="ce-gift-cards-section">
      <div className="ce-section-heading-row" style={{ marginBottom: '8px', alignItems: 'center' }}>
        <h2 className="ce-gift-cards-title" style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--ce-text)' }}>Gift Cards</h2>
        <Link to="/consumer-ecommerce/ads" className="ce-delivery-link" style={{ 
          background: 'linear-gradient(180deg, #2563eb, #1d4ed8)', 
          color: '#fff', 
          borderRadius: '8px',
          boxShadow: '0 4px 0 #1e3a8a, 0 6px 12px rgba(29, 78, 216, 0.4)', 
          padding: '10px 14px', 
          fontSize: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '-4px'
        }}>
          <HiOutlineTv style={{ fontSize: '18px' }} /> Watch & Earn
        </Link>
      </div>
      <div className="ce-gift-cards-grid">
        {giftCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="ce-gift-card">
              <div className="ce-gift-card-icon">
                <Icon />
              </div>
              <p className="ce-gift-card-name">{card.name}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
