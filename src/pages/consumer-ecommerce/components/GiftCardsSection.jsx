import { Link } from 'react-router-dom';
import { 
  LuBuilding2,
  LuGift,
  LuPlus,
  LuSmartphone,
  LuSparkles,
  LuTv,
} from 'react-icons/lu';

export default function GiftCardsSection() {
  const giftCards = [
    { id: 1, name: 'Trikonekt Gift Card', icon: LuGift },
    { id: 2, name: 'Reliance', icon: LuBuilding2 },
    { id: 3, name: 'Amazon', icon: LuBuilding2 },
    { id: 4, name: 'JIO', icon: LuSmartphone },
    { id: 5, name: 'Jio Allstar', icon: LuSparkles },
    { id: 6, name: 'Coffee Play', icon: LuGift },
    { id: 7, name: 'More', icon: LuPlus },
  ];

  return (
    <section className="ce-gift-cards-section">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Gift cards</h2>
          <p className="ce-section-subtitle">Simple treats and partner rewards</p>
        </div>
        <Link to="/consumer-ecommerce/ads" className="ce-section-link ce-watch-link">
          <LuTv /> Watch
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
