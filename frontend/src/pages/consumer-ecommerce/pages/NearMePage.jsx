import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowLeft,
  LuBadgePercent,
  LuBuilding2,
  LuChevronDown,
  LuFilter,
  LuHeart,
  LuHouse,
  LuHotel,
  LuMap,
  LuMapPin,
  LuMic,
  LuEllipsis,
  LuPawPrint,
  LuPlugZap,
  LuSearch,
  LuShoppingBasket,
  LuSparkles,
  LuStar,
  LuStore,
  LuStethoscope,
  LuTrash2,
  LuUtensils,
  LuWheat,
  LuWrench,
  LuSofa,
  LuScissors,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const cities = [
  { name: 'Bangalore', count: '12.4K+', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=360&q=80' },
  { name: 'Hyderabad', count: '8.7K+', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=360&q=80' },
  { name: 'Mumbai', count: '15.6K+', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=360&q=80' },
  { name: 'Chennai', count: '7.2K+', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=360&q=80' },
  { name: 'Pune', count: '6.1K+', image: 'https://images.unsplash.com/photo-1615154131651-6a4f7f2dbb21?auto=format&fit=crop&w=360&q=80' },
  { name: 'Delhi', count: '18.2K+', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=360&q=80' },
  { name: 'Goa', count: '3.4K+', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=360&q=80' },
];

const categories = [
  { name: 'Local Market', count: '1,245 places', icon: LuStore, tone: 'green' },
  { name: 'Farmers', count: '890 places', icon: LuWheat, tone: 'green' },
  { name: 'Grocery Stores', count: '2,340 places', icon: LuShoppingBasket, tone: 'orange' },
  { name: 'Restaurants', count: '3,210 places', icon: LuUtensils, tone: 'red' },
  { name: 'Hotels', count: '1,120 places', icon: LuHotel, tone: 'blue' },
  { name: 'Clinics', count: '680 places', icon: LuStethoscope, tone: 'cyan' },
  { name: 'Mechanics', count: '520 places', icon: LuWrench, tone: 'indigo' },
  { name: 'Salons', count: '430 places', icon: LuScissors, tone: 'pink' },
  { name: 'Electricians', count: '310 places', icon: LuPlugZap, tone: 'amber' },
  { name: 'Furniture', count: '720 places', icon: LuSofa, tone: 'brown' },
  { name: 'Pet Care', count: '210 places', icon: LuPawPrint, tone: 'rose' },
  { name: 'Home Services', count: '1,050 places', icon: LuHouse, tone: 'teal' },
  { name: 'Daily Needs', count: '920 places', icon: LuTrash2, tone: 'green' },
  { name: 'Street Food', count: '540 places', icon: LuUtensils, tone: 'orange' },
  { name: 'More', count: 'View all', icon: LuEllipsis, tone: 'indigo' },
];

const heroCategories = categories.slice(0, 4).concat(categories[14]);

const trendingCards = [
  { title: 'Fresh from Farmers', offer: 'Up to 30% OFF', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=420&q=80' },
  { title: 'Nearby Restaurants', offer: 'Flat 20% OFF', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=420&q=80' },
  { title: 'Home Services At Your Doorstep', offer: 'Up to 25% OFF', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=420&q=80' },
  { title: 'Grocery Deals', offer: 'Fresh basket sale', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=420&q=80' },
];

const listings = [
  {
    name: 'Green Valley Farms',
    category: 'Organic Vegetables',
    rating: '4.7',
    reviews: '512',
    distance: '2.1 km',
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: '10% OFF',
    tag: 'Organic',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Namma Krushi Farm',
    category: 'Fresh Vegetables',
    rating: '4.6',
    reviews: '386',
    distance: '2.8 km',
    status: 'Open now',
    close: 'Closes 8:30 PM',
    offer: '10% OFF',
    tag: 'Fresh',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Desi Organic Farm',
    category: 'Organic Fruits & Veggies',
    rating: '4.8',
    reviews: '203',
    distance: '3.2 km',
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: '20% OFF',
    tag: 'Organic',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Hilltop Greens',
    category: 'Leafy Greens',
    rating: '4.5',
    reviews: '278',
    distance: '4.1 km',
    status: 'Open now',
    close: 'Closes 8:00 PM',
    offer: '10% OFF',
    tag: 'Fresh',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Village Fresh Harvest',
    category: 'Vegetables & Fruits',
    rating: '4.6',
    reviews: '164',
    distance: '5.2 km',
    status: 'Open now',
    close: 'Closes 9:30 PM',
    offer: '15% OFF',
    tag: 'Farm Fresh',
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=360&q=80',
  },
];

const filters = ['All', 'Open Now', 'Organic', 'Nearby', 'Top Rated'];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NearMePage() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const visibleListings = useMemo(() => listings.map((item, index) => ({
    ...item,
    distance: selectedCity.name === 'Bangalore' ? item.distance : `${(1.3 + index * 0.5).toFixed(1)} km`,
  })), [selectedCity]);

  if (selectedCategory) {
    return (
      <div className="ce-app ce-nearme-wire">
        <main className="ce-nearme-list-shell">
          <header className="ce-nearme-list-head">
            <button type="button" onClick={() => setSelectedCategory(null)} aria-label="Back">
              <LuArrowLeft />
            </button>
            <div>
              <h1>{selectedCategory.name} in {selectedCity.name}</h1>
              <p>{selectedCategory.count}</p>
            </div>
            <button type="button" aria-label="Filters">
              <LuFilter />
            </button>
          </header>

          <section className="ce-nearme-list-filters" aria-label="Filters">
            {filters.map((filter) => (
              <button key={filter} type="button" className={filter === activeFilter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>
                {filter}
              </button>
            ))}
          </section>

          <section className="ce-nearme-business-list">
            {visibleListings.map((listing) => (
              <Link key={listing.name} to={`/consumer-ecommerce/nearby-stores?business=${slug(listing.name)}`} className="ce-nearme-business-card">
                <img src={listing.image} alt={listing.name} />
                <div className="ce-nearme-business-info">
                  <div className="ce-nearme-business-title">
                    <h2>{listing.name}</h2>
                    <LuHeart />
                  </div>
                  <p><LuStar /> {listing.rating} <span>({listing.reviews})</span></p>
                  <small>{listing.category} • {listing.distance}</small>
                  <strong>{listing.status} <span>• {listing.close}</span></strong>
                  <div>
                    <em>{listing.tag}</em>
                    <b>{listing.offer}</b>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </main>
        <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map">
          <LuMap />
          Map View
        </Link>
      </div>
    );
  }

  return (
    <div className="ce-app ce-nearme-wire">
      <main className="ce-nearme-wire-shell">
        <section className="ce-nearme-wire-hero">
          <div className="ce-nearme-wire-hero-bg" />
          <header className="ce-nearme-wire-top">
            <button type="button" className="ce-nearme-wire-menu" aria-label="Menu">
              <LuEllipsis />
            </button>
            <div>
              <h1>Nearby</h1>
              <p>Everything around you</p>
            </div>
            <button type="button" className="ce-nearme-wire-location">
              <LuMapPin />
              {selectedCity.name}
              <LuChevronDown />
            </button>
          </header>

          <label className="ce-nearme-wire-search">
            <LuSearch />
            <input placeholder="Search for anything nearby..." />
            <LuMic />
          </label>

          <div className="ce-nearme-wire-quick">
            {heroCategories.map(({ name, icon: Icon, tone }) => (
              <button key={name} type="button" onClick={() => name !== 'More' && setSelectedCategory(categories.find((item) => item.name === name))}>
                <span className={`tone-${tone}`}><Icon /></span>
                <strong>{name.replace(' Stores', '')}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="ce-nearme-wire-section ce-nearme-wire-cities">
          <div className="ce-nearme-wire-section-head">
            <h2>Top Cities</h2>
            <button type="button">View all</button>
          </div>
          <div className="ce-nearme-city-cards">
            {cities.slice(0, 6).map((city) => (
              <button key={city.name} type="button" className={city.name === selectedCity.name ? 'active' : ''} onClick={() => setSelectedCity(city)}>
                <img src={city.image} alt={city.name} />
                <span>{city.name}</span>
                <small>{city.count} businesses</small>
              </button>
            ))}
          </div>
        </section>

        <section className="ce-nearme-wire-section">
          <h2 className="ce-nearme-wire-title">Popular Categories</h2>
          <div className="ce-nearme-wire-category-grid">
            {categories.map(({ name, icon: Icon, tone }, index) => (
              <button key={name} type="button" onClick={() => setSelectedCategory(categories[index])}>
                <span className={`tone-${tone}`}><Icon /></span>
                <strong>{name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="ce-nearme-wire-section ce-nearme-wire-trending">
          <div className="ce-nearme-wire-section-head">
            <h2>Trending Near You</h2>
            <button type="button">View all</button>
          </div>
          <div className="ce-nearme-trend-mini-row">
            {trendingCards.map((card) => (
              <Link key={card.title} to="/consumer-ecommerce/nearby-stores" className="ce-nearme-trend-mini">
                <img src={card.image} alt={card.title} />
                <span>{card.title}</span>
                <small>{card.offer}</small>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map">
        <LuMap />
        Map View
      </Link>

      <BottomNav />
    </div>
  );
}
