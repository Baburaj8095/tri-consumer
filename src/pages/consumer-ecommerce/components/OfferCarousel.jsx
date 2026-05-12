import { Link } from 'react-router-dom';
import { offerBanners } from '../services/mockData.js';
import { 
  LuMapPin,
  LuShoppingBag,
  LuTruck,
  LuWalletCards,
} from 'react-icons/lu';

export default function OfferCarousel() {
  const filteredOffers = offerBanners.filter(offer =>
    ['Tripay', 'Tri Eat', 'Tri Drop', 'Tri Trip'].includes(offer.title)
  );

  const getServiceRoute = (title) => {
    switch (title) {
      case 'Tripay': return '/consumer-ecommerce/tripay';
      case 'Tri Eat': return '/consumer-ecommerce/trieat';
      case 'Tri Drop': return '/consumer-ecommerce/tripickdrop';
      case 'Tri Trip': return '/consumer-ecommerce/tritrip';
      default: return '/consumer-ecommerce';
    }
  };

  const getServiceIcon = (title) => {
    switch (title) {
      case 'Tripay': return <LuWalletCards size={24} />;
      case 'Tri Eat': return <LuShoppingBag size={24} />;
      case 'Tri Drop': return <LuTruck size={24} />;
      case 'Tri Trip': return <LuMapPin size={24} />;
      default: return <LuWalletCards size={24} />;
    }
  };

  return (
    <section className="ce-content-section ce-offer-carousel" aria-label="Tri Services">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Secondary categories</h2>
          <p className="ce-section-subtitle">Everything else, one tap away</p>
        </div>
      </div>
      <div className="offer-service-scroll">
        {filteredOffers.map((offer) => {
          return (
            <Link
              key={offer.id}
              to={getServiceRoute(offer.title)}
              className="offer-service-card"
            >
              <div className="offer-service-icon">
                {getServiceIcon(offer.title)}
              </div>
              <span className="offer-service-name">{offer.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
