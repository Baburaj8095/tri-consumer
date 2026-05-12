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

  return (
    <div className="ce-app ce-commerce-home">
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

          <button type="button" className="ce-commerce-location" onClick={cityModal.open}>
            <LuMapPin />
            <span>Deliver to Baburaj - {consumerProfile.city} {consumerProfile.pinCode}</span>
            <LuChevronDown />
          </button>

          <Link to="/consumer-ecommerce/near-me" className="ce-commerce-explore">
            <span><LuGrid2X2 /></span>
            <div>
              <strong>Explore Nearby</strong>
              <small>Find services & hotels around you</small>
            </div>
            <LuArrowRight />
          </Link>
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

          <section className="ce-adz-strip" aria-label="Adz only">
            <strong>Adz Only</strong>
            <div>
              {adzTiles.map((label) => (
                <Link key={label} to="/consumer-ecommerce/ads" className="ce-adz-chip">
                  <LuTag />
                  <span>{label}<small>Buy Now</small></span>
                </Link>
              ))}
            </div>
          </section>

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
