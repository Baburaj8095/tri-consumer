import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  LuShoppingBag
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

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

const filters = ['All', 'Open Now', 'Top Rated', 'Free Delivery'];

export default function NearMePage() {
  const navigate = useNavigate();
  const { location, showPicker, setShowPicker, saveLocation } = useLocation();
  const selectedCity = { name: location.city };
  const setSelectedCity = (city) => {
    saveLocation({
      ...location,
      city: city.name,
      formattedAddress: `${location.area || 'Indiranagar'}, ${city.name}`
    });
  };
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Channels: ONLINE, OFFLINE (Near Store), TRIZONE (Network Hooks)
  const [channelMode, setChannelMode] = useState('ONLINE');

  // Dynamic live loaded shops
  const [liveShops, setLiveShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);

  // Fetch B2C shops from the live Spring backend
  useEffect(() => {
    setLoadingShops(true);
    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        setLiveShops(res.data || []);
        setLoadingShops(false);
      })
      .catch(err => {
        console.error('Error fetching B2C live merchants:', err);
        setLoadingShops(false);
      });
  }, []);

  // Filter listings based on selected City & Search term & Category & Online Delivery capability
  const visibleListings = useMemo(() => {
    return liveShops.filter(shop => {
      // 1. Check if shop matches the city
      const shopCity = (shop.city || '').trim().toLowerCase();
      const chosenCity = selectedCity.name.toLowerCase();
      if (shopCity !== chosenCity) {
        return false;
      }

      // 2. Since this is NearMe Online portal, filter out purely offline shops
      const serviceMode = (shop.service_mode || 'ONLINE').toUpperCase();
      if (serviceMode === 'OFFLINE') {
        return false;
      }

      // 3. Category match if category chosen
      if (selectedCategory) {
        const catName = selectedCategory.name.toLowerCase();
        const shopTitle = (shop.shop_name || '').toLowerCase();

        // Perform semantic matching against store titles and attributes
        let match = false;
        if (catName.includes('farmers')) {
          match = shopTitle.includes('farm') || shopTitle.includes('kisan') || shopTitle.includes('organic') || shopTitle.includes('namma');
        } else if (catName.includes('grocery')) {
          match = shopTitle.includes('grocery') || shopTitle.includes('store') || shopTitle.includes('kirana') || shopTitle.includes('mart') || shopTitle.includes('super');
        } else if (catName.includes('restaurant') || catName.includes('street')) {
          match = shopTitle.includes('restaurant') || shopTitle.includes('hotel') || shopTitle.includes('food') || shopTitle.includes('eat') || shopTitle.includes('biryani') || shopTitle.includes('cafe');
        } else if (catName.includes('clinic') || catName.includes('pharmacy')) {
          match = shopTitle.includes('clinic') || shopTitle.includes('pharma') || shopTitle.includes('health') || shopTitle.includes('diag') || shopTitle.includes('doctor');
        } else {
          match = shopTitle.includes(catName.split(' ')[0]);
        }

        if (!match) return false;
      }

      // 4. Filter search input
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchTitle = (shop.shop_name || '').toLowerCase().includes(query);
        const matchAddr = (shop.address || '').toLowerCase().includes(query);
        if (!matchTitle && !matchAddr) {
          return false;
        }
      }

      // 5. Active filters ('All', 'Open Now', 'Top Rated', 'Free Delivery')
      if (activeFilter === 'Free Delivery') {
        const deliveryFee = parseFloat(shop.base_delivery_fee || '0');
        if (deliveryFee > 0) return false;
      }

      return true;
    });
  }, [liveShops, selectedCity, selectedCategory, searchTerm, activeFilter]);

  const handleChannelChange = (mode) => {
    setChannelMode(mode);
    if (mode === 'OFFLINE') {
      navigate('/consumer-ecommerce/nearby-stores');
    } else if (mode === 'TRIZONE') {
      navigate('/consumer-ecommerce/tri-zone');
    }
  };

  // If a category details view is active, render the filtered list of online shops and products
  if (selectedCategory) {
    return (
      <div className="ce-app ce-nearme-wire">
        <main className="ce-nearme-list-shell">
          <header className="ce-nearme-list-head" style={{ borderBottom: '1px solid #e2e8f0', pb: 1 }}>
            <button type="button" onClick={() => setSelectedCategory(null)} aria-label="Back">
              <LuArrowLeft />
            </button>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900 }}>{selectedCategory.name} in {selectedCity.name}</h1>
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: '0.75rem' }}>ONLINE DELIVERY ACTIVE</p>
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
            {loadingShops ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                Loading available shops...
              </div>
            ) : visibleListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <LuShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                <h3 style={{ fontWeight: 800, margin: '0 0 6px 0' }}>No Online Shops Available</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>There are currently no matching online delivery shops in {selectedCity.name}.</p>
              </div>
            ) : (
              visibleListings.map((listing) => (
                <Link key={listing.id} to={`/consumer-ecommerce/shop/${listing.id}`} className="ce-nearme-business-card" style={{ textDecoration: 'none' }}>
                  <img src={listing.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80'} alt={listing.shop_name} />
                  <div className="ce-nearme-business-info">
                    <div className="ce-nearme-business-title">
                      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{listing.shop_name}</h2>
                      <LuHeart />
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '4px 0', fontSize: '0.85rem' }}>
                      <LuStar style={{ fill: '#fbbf24', stroke: '#fbbf24' }} /> 
                      <strong>4.5</strong> 
                      <span style={{ color: '#94a3b8' }}>(118 ratings)</span>
                    </p>
                    <small>{listing.address || 'Local Area'} • Within {listing.delivery_radius_km || 5.0} km</small>
                    <strong style={{ margin: '4px 0 2px 0', display: 'block', fontSize: '0.8rem' }}>
                      Delivery Fee: <span style={{ color: '#10b981' }}>₹{listing.base_delivery_fee || '0'}</span> 
                      {parseFloat(listing.min_order_value || '0') > 0 && ` • Min Order: ₹${listing.min_order_value}`}
                    </strong>
                    <div style={{ marginTop: 8 }}>
                      <em style={{ fontStyle: 'normal', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>
                        FREE DELIVERY RAD
                      </em>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </section>
        </main>
        <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map" style={{ textDecoration: 'none' }}>
          <LuMap />
          Map View
        </Link>
      </div>
    );
  }

  return (
    <div className="ce-app ce-nearme-wire" style={{ pb: '100px' }}>
      <main className="ce-nearme-wire-shell">
        <section className="ce-nearme-wire-hero">
          <div className="ce-nearme-wire-hero-bg" />
          <header className="ce-nearme-wire-top">
            <button type="button" className="ce-nearme-wire-menu" aria-label="Menu">
              <LuEllipsis />
            </button>
            <div>
              <h1 style={{ fontWeight: 900 }}>Nearby Marketplace</h1>
              <p>Everything around you</p>
            </div>
            <button type="button" className="ce-nearme-wire-location" onClick={() => setShowPicker(true)}>
              <LuMapPin />
              {location.area}, {location.city}
              <LuChevronDown />
            </button>
          </header>

          {/* CHANNEL CHANNEL CONTROLS */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 4, margin: '14px 16px 14px 16px', backdropFilter: 'blur(10px)' }}>
            <button 
              onClick={() => handleChannelChange('ONLINE')} 
              style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, background: channelMode === 'ONLINE' ? '#fff' : 'none', color: channelMode === 'ONLINE' ? '#ea580c' : '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Online Shop
            </button>
            <button 
              onClick={() => handleChannelChange('OFFLINE')} 
              style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, background: channelMode === 'OFFLINE' ? '#fff' : 'none', color: channelMode === 'OFFLINE' ? '#ea580c' : '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Near Store
            </button>
            <button 
              onClick={() => handleChannelChange('TRIZONE')} 
              style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, background: channelMode === 'TRIZONE' ? '#fff' : 'none', color: channelMode === 'TRIZONE' ? '#ea580c' : '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tri Zone
            </button>
          </div>

          <label className="ce-nearme-wire-search" style={{ margin: '0 16px 14px 16px' }}>
            <LuSearch />
            <input 
              placeholder="Search active online shops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        {/* CITIES CHANNEL */}
        <section className="ce-nearme-wire-section ce-nearme-wire-cities" style={{ px: 2 }}>
          <div className="ce-nearme-wire-section-head">
            <h2 style={{ fontWeight: 800 }}>Top Cities</h2>
            <button type="button" style={{ fontWeight: 700, color: '#f97316' }}>View all</button>
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

        {/* ONLINE SHOPS RENDER */}
        <section className="ce-nearme-wire-section" style={{ padding: '4px 16px 160px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Online Shops with Delivery</h2>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>({visibleListings.length} active)</span>
          </div>

          {loadingShops ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              Loading B2C stores...
            </div>
          ) : visibleListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <LuShoppingBag size={36} style={{ color: '#cbd5e1', marginBottom: 8 }} />
              <h4 style={{ fontWeight: 800, margin: '0 0 4px 0', color: '#475569' }}>No Active Online Stores</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Verify if other cities have stores available or switch modes.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleListings.map(shop => (
                <Link key={shop.id} to={`/consumer-ecommerce/shop/${shop.id}`} style={{ textDecoration: 'none', display: 'flex', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <img src={shop.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80'} alt={shop.shop_name} style={{ width: 110, height: 110, objectFit: 'cover' }} />
                  <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{shop.shop_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '2px 0' }}>
                      <LuStar style={{ fill: '#fbbf24', stroke: '#fbbf24', width: 12, height: 12 }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>4.5</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Delivery Fee: ₹{shop.base_delivery_fee || '0'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{shop.address || shop.city}</span>
                    <span style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 700, marginTop: 4 }}>MIN ORDER: ₹{shop.min_order_value || '0'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>

      <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map" style={{ textDecoration: 'none' }}>
        <LuMap />
        Map View
      </Link>

      <BottomNav />
      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
