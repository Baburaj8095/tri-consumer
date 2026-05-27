import { Link } from 'react-router-dom';
import { 
  LuCreditCard,
  LuDroplets,
  LuFlame,
  LuGift,
  LuShieldCheck,
  LuSmartphone,
  LuTv,
  LuWifi,
  LuZap,
} from 'react-icons/lu';

export default function GiftCardsSection() {
  const giftCards = [
    { id: 1, name: 'Trikonnekt Gift Card', icon: LuGift },
    { id: 2, name: 'Mobile Recharge', icon: LuSmartphone },
    { id: 3, name: 'Electricity Bill', icon: LuZap },
    { id: 4, name: 'Water Bill', icon: LuDroplets },
    { id: 5, name: 'Gas Bill', icon: LuFlame },
    { id: 6, name: 'DTH Recharge', icon: LuTv },
    { id: 7, name: 'Broadband Bill', icon: LuWifi },
    { id: 8, name: 'Credit Card Bill', icon: LuCreditCard },
    { id: 9, name: 'Insurance Premium', icon: LuShieldCheck },
  ];

  return (
    <section className="ce-gift-cards-section">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Gift Cards & Utilities</h2>
          <p className="ce-section-subtitle">Recharges, bill payments and rewards</p>
        </div>
        <Link to="/consumer-ecommerce/ads" className="ce-section-link ce-watch-link">
          <LuTv /> Watch
        </Link>
      </div>
      <div 
        className="ce-gift-cards-grid" 
        style={{ 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          overflowX: 'visible', 
          gap: '10px' 
        }}
      >
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
