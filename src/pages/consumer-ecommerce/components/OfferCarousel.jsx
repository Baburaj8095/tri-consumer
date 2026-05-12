import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerBanners } from '../services/mockData.js';
import { 
  HiOutlineWallet, 
  HiOutlineShoppingBag, 
  HiOutlineTruck, 
  HiOutlineMapPin 
} from 'react-icons/hi2';

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
      case 'Tripay': return <HiOutlineWallet size={26} />;
      case 'Tri Eat': return <HiOutlineShoppingBag size={26} />;
      case 'Tri Drop': return <HiOutlineTruck size={26} />;
      case 'Tri Trip': return <HiOutlineMapPin size={26} />;
      default: return <HiOutlineWallet size={26} />;
    }
  };

  const serviceStyles = {
    Tripay: { bg: '#dbeafe', accent: '#2563eb' },
    'Tri Eat': { bg: '#ffedd5', accent: '#ea580c' },
    'Tri Drop': { bg: '#d1fae5', accent: '#059669' },
    'Tri Trip': { bg: '#bfdbfe', accent: '#0284c7' },
  };

  return (
    <section className="ce-offer-carousel" aria-label="Tri Services">
      <div className="offer-service-scroll">
        {filteredOffers.map((offer) => {
          const style = serviceStyles[offer.title] || { bg: '#f8fafc', accent: '#0f172a' };
          return (
            <Link
              key={offer.id}
              to={getServiceRoute(offer.title)}
              className="offer-service-card"
              style={{
                background: `linear-gradient(180deg, ${style.bg}, ${style.bg} 100%)`,
                color: style.accent,
              }}
            >
              <div className="offer-service-icon" style={{ color: style.accent }}>
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
