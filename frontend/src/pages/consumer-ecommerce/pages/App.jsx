import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuCamera,
  LuCar,
  LuChevronDown,
  LuGift,
  LuGrid2X2,
  LuIndianRupee,
  LuMapPin,
  LuMic,
  LuEllipsis,
  LuPackage,
  LuSearch,
  LuShirt,
  LuShoppingBag,
  LuSmartphone,
  LuSofa,
  LuStar,
  LuTag,
  LuTruck,
  LuUtensils,
} from 'react-icons/lu';
import Header from '../components/Header.jsx';
import LocationSelectorModal from '../components/LocationSelectorModal.jsx';
import DealsSection from '../components/DealsSection.jsx';
import GiftCardsSection from '../components/GiftCardsSection.jsx';
import AdsCarousel from '../components/AdsCarousel.jsx';
import ActionGrid from '../components/ActionGrid.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useModal } from '../hooks/useModal.js';
import { consumerProfile, products } from '../services/mockData.js';
import '../consumerEcommerce.css';

const quickServices = [
  { label: 'Tri Pay', sub: 'Pay Bills', icon: LuIndianRupee, to: '/consumer-ecommerce/tripay' },
  { label: 'Tri Zone', sub: 'Services', icon: LuPackage, to: '/consumer-ecommerce/delivery' },
  { label: 'Tri Eat', sub: 'Food Delivery', icon: LuUtensils, to: '/consumer-ecommerce/trieat' },
  { label: 'Tri Drop', sub: 'Parcel Delivery', icon: LuTruck, to: '/consumer-ecommerce/tripickdrop' },
  { label: 'Tri Trip', sub: 'Ride Booking', icon: LuCar, to: '/consumer-ecommerce/tritrip' },
  { label: 'More', sub: 'Options', icon: LuEllipsis, to: '/consumer-ecommerce/delivery' },
];

const categoryTiles = [
  { label: 'Daily Needs', sub: '', icon: LuGift, to: '/consumer-ecommerce/delivery' },
  { label: 'Mobiles', sub: '', icon: LuSmartphone, to: '/consumer-ecommerce/delivery' },
  { label: 'Fashion', sub: '', icon: LuShirt, to: '/consumer-ecommerce/delivery' },
  { label: 'Furniture', sub: '', icon: LuSofa, to: '/consumer-ecommerce/delivery' },
  { label: 'Beauty', sub: '', icon: LuTag, to: '/consumer-ecommerce/delivery' },
  { label: 'Kids & Toys', sub: '', icon: LuGift, to: '/consumer-ecommerce/delivery' },
  { label: 'More', sub: '', icon: LuGrid2X2, to: '/consumer-ecommerce/delivery' },
];

const trackingTiles = [
  { title: 'Tri Zone', copy: 'Shopping', icon: LuShoppingBag, to: '/consumer-ecommerce/delivery' },
  { title: 'Tri Delivery Track', copy: 'Track your orders', icon: LuTruck, to: '/consumer-ecommerce/delivery' },
  { title: 'Online Shopping', copy: 'Track all online orders', icon: LuShoppingBag, to: '/consumer-ecommerce/delivery' },
  { title: 'Private Delivery Track', copy: 'Track private orders', icon: LuPackage, to: '/consumer-ecommerce/delivery' },
];

const adzTiles = [
  'Cashback Adz',
  'Gift Adz',
  'Shopping Adz',
  'Daily Adz',
  'Audio Adz',
  'Sneaker Adz',
];

const promoDeals = [
  {
    title: 'Mega Mobile Rush',
    urgency: 'Ends in 02:18:44',
    label: 'Up to 65% off',
    discount: 'Extra Rs. 1,500 off',
    cashback: '10% Tri Pay cashback',
    bank: 'SBI card instant saving',
    prime: 'Tri Prime fast delivery',
    cta: 'Swipe deal',
    tone: 'orange',
    ambient: {
      soft: 'rgba(251, 146, 60, 0.22)',
      glow: 'rgba(250, 204, 21, 0.22)',
      header: 'rgba(251, 191, 36, 0.32)',
    },
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1600087626014-e652e18bbff2?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Fashion Flash Drop',
    urgency: 'Trending near you',
    label: 'Min 50% off',
    discount: 'Buy 2 save more',
    cashback: 'Rs. 200 wallet rewards',
    bank: 'Axis bank bonus',
    prime: 'Prime fitting exchange',
    cta: 'Grab now',
    tone: 'pink',
    ambient: {
      soft: 'rgba(216, 180, 254, 0.28)',
      glow: 'rgba(244, 114, 182, 0.22)',
      header: 'rgba(236, 72, 153, 0.3)',
    },
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Home Upgrade Fest',
    urgency: 'Prime early access',
    label: '40-70% off',
    discount: 'Combo price crash',
    cashback: '5% cashback unlocked',
    bank: 'HDFC no-cost EMI',
    prime: 'Prime doorstep setup',
    cta: 'Shop sets',
    tone: 'green',
    ambient: {
      soft: 'rgba(45, 212, 191, 0.24)',
      glow: 'rgba(250, 204, 21, 0.18)',
      header: 'rgba(20, 184, 166, 0.28)',
    },
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Grocery Super Saver',
    urgency: 'Fresh slots closing',
    label: 'Daily deals',
    discount: 'Flat 30% essentials',
    cashback: 'Rs. 99 Tri Coins back',
    bank: 'UPI bonus offer',
    prime: 'Prime 20-min slots',
    cta: 'Fill basket',
    tone: 'blue',
    ambient: {
      soft: 'rgba(125, 211, 252, 0.26)',
      glow: 'rgba(52, 211, 153, 0.18)',
      header: 'rgba(56, 189, 248, 0.28)',
    },
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=360&q=80',
    ],
  },
];

const adDeals = [
  {
    title: 'Cashback Adz Mela',
    urgency: 'Sponsored Deal',
    label: 'Up to 50% off',
    discount: 'Extra wallet cashback',
    cashback: '15% Tri Pay reward',
    bank: 'All UPI transactions',
    prime: 'Tri Prime early access',
    cta: 'Explore Ad',
    tone: 'orange',
    ambient: {
      soft: 'rgba(251, 146, 60, 0.22)',
      glow: 'rgba(250, 204, 21, 0.22)',
      header: 'rgba(251, 191, 36, 0.32)',
    },
    images: [
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Brand Gift Adz',
    urgency: 'Hot Brand Offer',
    label: 'Flat 40% off',
    discount: 'Free gift vouchers',
    cashback: 'Rs. 500 flat cashback',
    bank: 'ICICI bank instant saving',
    prime: 'Free delivery with Prime',
    cta: 'Redeem Gift',
    tone: 'pink',
    ambient: {
      soft: 'rgba(216, 180, 254, 0.28)',
      glow: 'rgba(244, 114, 182, 0.22)',
      header: 'rgba(236, 72, 153, 0.3)',
    },
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Weekly Shopping Adz',
    urgency: 'Trending Sponsor',
    label: 'Min 60% off',
    discount: 'Combo coupons inside',
    cashback: 'Double Tri Coins active',
    bank: 'SBI credit card discount',
    prime: 'Doorstep exchange available',
    cta: 'Shop Now',
    tone: 'green',
    ambient: {
      soft: 'rgba(45, 212, 191, 0.24)',
      glow: 'rgba(250, 204, 21, 0.18)',
      header: 'rgba(20, 184, 166, 0.28)',
    },
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=360&q=80',
    ],
  },
  {
    title: 'Premium Audio Adz',
    urgency: 'Featured Product',
    label: 'Up to 75% off',
    discount: 'No cost EMI options',
    cashback: 'Flat Rs. 1,000 back',
    bank: 'HDFC card instant discount',
    prime: 'Prime early access open',
    cta: 'Buy Audio',
    tone: 'blue',
    ambient: {
      soft: 'rgba(125, 211, 252, 0.26)',
      glow: 'rgba(52, 211, 153, 0.18)',
      header: 'rgba(56, 189, 248, 0.28)',
    },
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
      'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=360&q=80',
    ],
  }
];

function PromoDealCarousel({ title, subtitle, deals, onActiveChange }) {
  const carouselRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const firstCard = carousel.querySelector('.ce-promo-deal-card');
      const step = firstCard ? firstCard.getBoundingClientRect().width + 12 : carousel.clientWidth * 0.84;
      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - step;

      carousel.scrollTo({
        left: atEnd ? 0 : carousel.scrollLeft + step,
        behavior: 'smooth',
      });
    }, 4300);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const updateActiveBanner = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      const cards = Array.from(carousel.querySelectorAll('.ce-promo-deal-card'));
      const carouselCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - carouselCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      onActiveChange(closestIndex);
    });
  };

  return (
    <section className="ce-promo-deals" aria-label={title}>
      <div className="ce-promo-deals-head">
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        <Link to="/consumer-ecommerce/delivery">View all</Link>
      </div>

      <div className="ce-promo-deal-carousel" ref={carouselRef} onScroll={updateActiveBanner}>
        {deals.map((deal, index) => (
          <Link
            key={deal.title}
            to="/consumer-ecommerce/delivery"
            className={`ce-promo-deal-card ce-promo-deal-card-${deal.tone}`}
            onFocus={() => onActiveChange(index)}
            onMouseEnter={() => onActiveChange(index)}
          >
            <span className="ce-promo-shimmer" aria-hidden="true" />
            <div className="ce-promo-deal-top">
              <div className="ce-promo-live-row">
                <span>Live now</span>
                <small>{deal.urgency}</small>
              </div>
              <h3>{deal.title}</h3>
              <div>
                <b>{deal.label}</b>
                <em>{deal.discount}</em>
              </div>
            </div>

            <div className="ce-promo-product-stage" aria-hidden="true">
              {deal.images.map((image, imageIndex) => (
                <img key={image} src={image} alt="" className={`ce-promo-product-${imageIndex + 1}`} />
              ))}
              <span>Hot</span>
            </div>

            <div className="ce-promo-deal-bottom">
              <small>{deal.cashback}</small>
              <small>{deal.bank}</small>
              <small>{deal.prime}</small>
              <b>{deal.cta}</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductDealCard({ product, index }) {
  const ratings = ['4.4 (1.2K)', '4.3 (987)', '4.6 (567)', '4.2 (1.1K)'];

  return (
    <Link to={`/consumer-ecommerce/product/${product.id}`} className="ce-commerce-product-card">
      <div className="ce-commerce-image-wrap">
        <img src={product.image} alt={product.name} />
        <span className="ce-commerce-discount">{product.discount}</span>
      </div>
      <div className="ce-commerce-product-body">
        <h3>{product.name}</h3>
        <div className="ce-commerce-price-row">
          <strong>{product.newPrice}</strong>
          <span>{product.oldPrice}</span>
        </div>
        <div className="ce-commerce-meta-row">
          <span className="ce-commerce-rating"><LuStar /> {ratings[index % ratings.length]}</span>
          <span className="ce-commerce-cart"><LuShoppingBag /></span>
        </div>
      </div>
    </Link>
  );
}

function ProductHorizontalCard({ product, index }) {
  const ratings = ['4.4 (1.2K)', '4.3 (987)', '4.6 (567)', '4.2 (1.1K)'];

  return (
    <Link to={`/consumer-ecommerce/product/${product.id}`} className="ce-commerce-horizontal-product">
      <div className="ce-commerce-image-wrap">
        <img src={product.image} alt={product.name} />
        <span className="ce-commerce-discount">{product.discount}</span>
      </div>
      <h3>{product.name}</h3>
      <div className="ce-commerce-price-row">
        <strong>{product.newPrice}</strong>
        <span>{product.oldPrice}</span>
      </div>
      <p>{ratings[index % ratings.length]}</p>
    </Link>
  );
}

export default function App() {
  const cityModal = useModal();
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [ambientColors, setAmbientColors] = useState(promoDeals[0].ambient);

  return (
    <div
      className="ce-app ce-commerce-home"
      style={{
        '--ce-active-promo-soft': ambientColors.soft,
        '--ce-active-promo-glow': ambientColors.glow,
        '--ce-active-promo-header': ambientColors.header,
      }}
    >
      <Header />
      <main className="ce-commerce-main">
        <section className="ce-service-strip" aria-label="Quick services">
          {quickServices.map(({ label, sub, icon: Icon, to }) => (
            <Link key={label} to={to} className="ce-service-tile">
              <Icon />
              <strong>{label}</strong>
              <span>{sub}</span>
            </Link>
          ))}
        </section>

        <section className="ce-commerce-search-section">
          <Link to="/consumer-ecommerce/delivery" className="ce-commerce-search">
            <LuSearch />
            <span>Search for products, brands and more</span>
            <LuCamera />
            <LuMic />
          </Link>

          <div className="ce-commerce-location">
            <button type="button" onClick={cityModal.open}>
              <LuMapPin />
              <span>Deliver to Baburaj - {consumerProfile.city} {consumerProfile.pinCode}</span>
              <LuChevronDown />
            </button>
            <Link to="/consumer-ecommerce/join-prime">
              Join Tri Prime
            </Link>
          </div>

          <Link to="/consumer-ecommerce/near-me" className="ce-commerce-explore">
            <span><LuGrid2X2 /></span>
            <div>
              <strong>Explore Nearby</strong>
              <small>Find services around you</small>
            </div>
            <LuArrowRight />
          </Link>

          <PromoDealCarousel
            title="Live deals for you"
            subtitle="Fresh drops, bank offers and Prime perks"
            deals={promoDeals}
            onActiveChange={(index) => {
              setActivePromoIndex(index);
              setAmbientColors(promoDeals[index].ambient);
            }}
          />
        </section>

        <section className="ce-commerce-full-stack">
          <DealsSection />
          <GiftCardsSection />

          <section className="ce-commerce-tracking-row" aria-label="Tracking utilities">
            {trackingTiles.map(({ title, copy, icon: Icon, to }) => (
              <Link key={title} to={to} className="ce-commerce-track-tile">
                <Icon />
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
              </Link>
            ))}
          </section>

          <section className="ce-commerce-card-section">
            <div className="ce-commerce-section-head">
              <h2>All Categories</h2>
            </div>
            <div className="ce-commerce-category-row" aria-label="Shopping categories">
              {categoryTiles.map(({ label, sub, icon: Icon, to }) => (
                <Link key={label} to={to} className="ce-commerce-category">
                  <Icon />
                  <strong>{label}</strong>
                  {sub && <span>{sub}</span>}
                </Link>
              ))}
            </div>
          </section>

          <PromoDealCarousel
            title="TriAdz Arena"
            subtitle="Fresh ads, brand deals and sponsored offers"
            deals={adDeals}
            onActiveChange={(index) => {
              setActiveAdIndex(index);
              setAmbientColors(adDeals[index].ambient);
            }}
          />

          <section className="ce-premium-action-banners">
            <Link to="/consumer-ecommerce/society" className="ce-action-banner">
              <div className="ce-action-banner-main">
                <div className="ce-action-banner-icon"><LuUtensils /></div>
                <div className="label">
                  <h3>For Better Society</h3>
                  <p>Join our community initiatives</p>
                </div>
              </div>
              <span className="ce-action-cta">Join</span>
            </Link>

            <Link to="/consumer-ecommerce/business" className="ce-action-banner">
              <div className="ce-action-banner-main">
                <div className="ce-action-banner-icon"><LuPackage /></div>
                <div className="label">
                  <h3>List Your Business</h3>
                  <p>Grow with Trikonekt today</p>
                </div>
              </div>
              <span className="ce-action-cta">List Now</span>
            </Link>
          </section>

          <section className="ce-content-section">
            <div className="ce-section-heading-row">
              <div>
                <h2 className="ce-section-title">Weekly offers mela</h2>
                <p className="ce-section-subtitle">50% to 70% offer Product</p>
              </div>
              <Link to="/consumer-ecommerce/delivery" className="ce-section-link">View all</Link>
            </div>
            <div className="ce-weekly-offer-row">
              {products.map((product, index) => (
                <ProductDealCard key={`weekly-${product.id}`} product={product} index={index} />
              ))}
            </div>
          </section>

          <section className="ce-content-section">
            <div className="ce-section-heading-row">
              <div>
                <h2 className="ce-section-title">Clothing Deals for You</h2>
                <p className="ce-section-subtitle">More compact deals from your catalogue</p>
              </div>
            </div>
            <div className="ce-clothing-deal-grid">
              {products.map((product, index) => (
                <ProductHorizontalCard key={`clothing-${product.id}`} product={product} index={index} />
              ))}
            </div>
          </section>

          <ActionGrid />
          <AdsCarousel />
        </section>
      </main>
      <LocationSelectorModal isOpen={cityModal.isOpen} onClose={cityModal.close} />
      <BottomNav />
    </div>
  );
}
