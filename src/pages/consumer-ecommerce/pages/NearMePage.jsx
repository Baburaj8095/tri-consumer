import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuActivity,
  LuArrowLeft,
  LuBadgePercent,
  LuBed,
  LuBookOpen,
  LuBuilding2,
  LuCalendar,
  LuChevronDown,
  LuCompass,
  LuCpu,
  LuCreditCard,
  LuDumbbell,
  LuEllipsis,
  LuFilter,
  LuGamepad,
  LuGift,
  LuGlobe,
  LuGraduationCap,
  LuHammer,
  LuHeart,
  LuHeartPulse,
  LuHouse,
  LuHotel,
  LuInfo,
  LuMap,
  LuMapPin,
  LuMic,
  LuNavigation,
  LuPackage,
  LuPackageCheck,
  LuPawPrint,
  LuPenTool,
  LuPlane,
  LuPlugZap,
  LuReceiptText,
  LuRotateCcw,
  LuScissors,
  LuSearch,
  LuShieldAlert,
  LuShoppingBasket,
  LuShoppingCart,
  LuSmartphone,
  LuSofa,
  LuSparkles,
  LuSprout,
  LuStar,
  LuStore,
  LuStethoscope,
  LuTicket,
  LuTrash2,
  LuTruck,
  LuTv,
  LuUser,
  LuUtensils,
  LuWheat,
  LuWrench,
  LuX,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

// Cities metadata
const cities = [
  { name: 'Bangalore', count: '12.4K+', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=360&q=80', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', count: '8.7K+', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=360&q=80', lat: 17.3850, lng: 78.4867 },
  { name: 'Mumbai', count: '15.6K+', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=360&q=80', lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai', count: '7.2K+', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=360&q=80', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', count: '6.1K+', image: 'https://images.unsplash.com/photo-1615154131651-6a4f7f2dbb21?auto=format&fit=crop&w=360&q=80', lat: 18.5204, lng: 73.8567 },
  { name: 'Delhi', count: '18.2K+', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=360&q=80', lat: 28.6139, lng: 77.2090 },
  { name: 'Goa', count: '3.4K+', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=360&q=80', lat: 15.2993, lng: 74.1240 },
];

// States list
const states = [
  { name: 'Karnataka', citiesCount: '45 cities', code: 'KA' },
  { name: 'Maharashtra', citiesCount: '62 cities', code: 'MH' },
  { name: 'Telangana', citiesCount: '28 cities', code: 'TS' },
  { name: 'Tamil Nadu', citiesCount: '38 cities', code: 'TN' },
  { name: 'Delhi NCR', citiesCount: '5 cities', code: 'DL' },
  { name: 'Goa State', citiesCount: '12 cities', code: 'GA' },
];

// Featured services
const featuredServices = [
  { name: 'Instant Electrician', copy: 'Available in 15 mins', icon: LuPlugZap, tone: 'amber' },
  { name: 'Express Grocery', copy: 'Free delivery', icon: LuShoppingBasket, tone: 'orange' },
  { name: 'Emergency Doctor', copy: '24/7 Virtual consult', icon: LuStethoscope, tone: 'cyan' },
  { name: 'Doorstep Salon', copy: 'Top stylists at home', icon: LuScissors, tone: 'pink' },
];

// Categories list
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
  { name: 'More', count: 'Explore everything', icon: LuEllipsis, tone: 'indigo' },
];

const trendingCards = [
  { title: 'Fresh from Farmers', offer: 'Up to 30% OFF', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=420&q=80' },
  { title: 'Nearby Restaurants', offer: 'Flat 20% OFF', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=420&q=80' },
  { title: 'Home Services At Your Doorstep', offer: 'Up to 25% OFF', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=420&q=80' },
  { title: 'Grocery Deals', offer: 'Fresh basket sale', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=420&q=80' },
];

// Rich Business Listings Database with local coordinates
const listings = [
  {
    name: 'Green Valley Farms',
    category: 'Farmers',
    rating: '4.7',
    reviews: '512',
    latOffset: 0.004,
    lngOffset: -0.005,
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: '10% OFF',
    tag: 'Organic',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Namma Krushi Farm',
    category: 'Farmers',
    rating: '4.6',
    reviews: '386',
    latOffset: -0.003,
    lngOffset: 0.004,
    status: 'Open now',
    close: 'Closes 8:30 PM',
    offer: 'Fresh Harvest',
    tag: 'Direct Buy',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Indiranagar Local Market',
    category: 'Local Market',
    rating: '4.5',
    reviews: '1.2K',
    latOffset: 0.001,
    lngOffset: -0.001,
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: 'Flat 10% OFF',
    tag: 'Popular Hub',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Metro Supermarket',
    category: 'Grocery Stores',
    rating: '4.4',
    reviews: '890',
    latOffset: 0.008,
    lngOffset: -0.007,
    status: 'Open now',
    close: 'Closes 10:00 PM',
    offer: 'Buy 1 Get 1 Free',
    tag: 'Supermarket',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'The Royal Biryani House',
    category: 'Restaurants',
    rating: '4.8',
    reviews: '1.5K',
    latOffset: -0.006,
    lngOffset: 0.002,
    status: 'Open now',
    close: 'Closes 11:30 PM',
    offer: 'Flat 20% OFF',
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Cafe Coffee Lounge',
    category: 'Restaurants',
    rating: '4.3',
    reviews: '412',
    latOffset: -0.002,
    lngOffset: -0.003,
    status: 'Open now',
    close: 'Closes 11:00 PM',
    offer: 'Free Dessert',
    tag: 'Cosy Vibe',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Grand Palace Hotel',
    category: 'Hotels',
    rating: '4.9',
    reviews: '670',
    latOffset: 0.006,
    lngOffset: 0.005,
    status: 'Open now',
    close: '24 Hours Open',
    offer: '15% OFF Rooms',
    tag: 'Luxury',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Apollo Family Clinic',
    category: 'Clinics',
    rating: '4.5',
    reviews: '230',
    latOffset: -0.005,
    lngOffset: 0.006,
    status: 'Open now',
    close: 'Closes 8:00 PM',
    offer: 'Free Consultation',
    tag: 'Specialist Care',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Express Auto Care',
    category: 'Mechanics',
    rating: '4.6',
    reviews: '180',
    latOffset: 0.003,
    lngOffset: -0.004,
    status: 'Open now',
    close: 'Closes 7:30 PM',
    offer: 'Free Car Wash',
    tag: 'Fast Service',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Mirror Mirror Salon & Spa',
    category: 'Salons',
    rating: '4.7',
    reviews: '340',
    latOffset: 0.002,
    lngOffset: 0.003,
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: 'Flat 15% OFF',
    tag: 'Unisex',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'QuickFix Electricals',
    category: 'Electricians',
    rating: '4.4',
    reviews: '90',
    latOffset: -0.004,
    lngOffset: -0.002,
    status: 'Open now',
    close: 'Closes 6:00 PM',
    offer: 'No Visit Charge',
    tag: 'Certified',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Royal Oak Furniture',
    category: 'Furniture',
    rating: '4.5',
    reviews: '550',
    latOffset: 0.005,
    lngOffset: 0.008,
    status: 'Open now',
    close: 'Closes 9:00 PM',
    offer: 'Up to 30% OFF',
    tag: 'Modern',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Perfect Cleaners Co',
    category: 'Home Services',
    rating: '4.7',
    reviews: '310',
    latOffset: -0.008,
    lngOffset: -0.004,
    status: 'Open now',
    close: 'Closes 8:00 PM',
    offer: '10% OFF Cleaning',
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Pet Paradise Clinic & Spa',
    category: 'Pet Care',
    rating: '4.8',
    reviews: '120',
    latOffset: 0.001,
    lngOffset: 0.004,
    status: 'Open now',
    close: 'Closes 8:00 PM',
    offer: 'Free Consultation',
    tag: 'Pet Friendly',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'QuickStop Provisions',
    category: 'Daily Needs',
    rating: '4.2',
    reviews: '75',
    latOffset: -0.001,
    lngOffset: -0.006,
    status: 'Open now',
    close: 'Closes 10:30 PM',
    offer: 'Fresh milk & bread',
    tag: 'Essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
  },
  {
    name: 'Spicy Chaat Express',
    category: 'Street Food',
    rating: '4.6',
    reviews: '410',
    latOffset: -0.002,
    lngOffset: 0.002,
    status: 'Open now',
    close: 'Closes 10:00 PM',
    offer: 'Famous Pani Puri',
    tag: 'Chaat Corner',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=360&q=80',
  },
];

const filters = ['All', 'Open Now', 'Organic', 'Nearby', 'Top Rated'];

// Haversine distance formula
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NearMePage() {
  const navigate = useNavigate();

  // Defensive parameter reading natively
  const getQueryParam = (name, defaultValue = null) => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || defaultValue;
  };

  const initialCityName = getQueryParam('city', 'Bangalore');
  const initialCategoryName = getQueryParam('category', null);
  const initialMode = getQueryParam('mode', 'explore');
  const initialOnline = getQueryParam('online', 'false') === 'true';

  const [selectedCity, setSelectedCity] = useState(() => {
    return cities.find(c => c.name.toLowerCase() === initialCityName.toLowerCase()) || cities[0];
  });
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return categories.find(c => c.name.toLowerCase() === (initialCategoryName || '').toLowerCase()) || null;
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnlineMode, setIsOnlineMode] = useState(initialOnline);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // GPS / Geolocation State
  const [userCoords, setUserCoords] = useState(null);
  const [gpsState, setGpsState] = useState('idle'); // idle, fetching, active, denied
  const [gpsMessage, setGpsMessage] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState(initialMode); // explore, list, map
  const [loading, setLoading] = useState(false);
  const [activeMapListing, setActiveMapListing] = useState(null);

  // Natively update URL parameters to avoid React Router render hooks loops
  const updateURLParams = (updatedParams) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const newSearch = params.toString();
    const newURL = window.location.pathname + (newSearch ? '?' + newSearch : '');
    window.history.pushState(null, '', newURL);
  };

  // Synchronize state with URL parameters natively for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const cityParam = getQueryParam('city', 'Bangalore');
      const foundCity = cities.find(c => c.name.toLowerCase() === cityParam.toLowerCase()) || cities[0];
      setSelectedCity(foundCity);

      const catParam = getQueryParam('category', '');
      const foundCat = categories.find(c => c.name.toLowerCase() === catParam.toLowerCase()) || null;
      setSelectedCategory(foundCat);

      const modeParam = getQueryParam('mode', 'explore');
      setViewMode(modeParam);

      const onlineParam = getQueryParam('online', 'false') === 'true';
      setIsOnlineMode(onlineParam);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle GPS location simulation
  const fetchGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsState('denied');
      setGpsMessage('Geolocation not supported by this browser.');
      return;
    }
    setGpsState('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsState('active');
        setGpsMessage('GPS Location Active');
        // Find nearest city
        let closestCity = cities[0];
        let minDistance = Number.MAX_VALUE;
        cities.forEach(city => {
          const dist = getDistanceInKm(position.coords.latitude, position.coords.longitude, city.lat, city.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        });
        setSelectedCity(closestCity);
        setIsOnlineMode(false);
        updateURLParams({ city: closestCity.name, mode: viewMode });
      },
      (error) => {
        console.error('GPS permission denied:', error);
        setGpsState('denied');
        setGpsMessage('Location permission denied. Falling back to default city center.');
        setUserCoords(null);
      }
    );
  };

  // Quick action options (TriZone, Near Store, Online, Restaurants, Hotels, etc.)
  const handleQuickAction = (name) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);

    if (name === 'TriZone') {
      navigate('/consumer-ecommerce/tri-zone');
    } else if (name === 'Near Store') {
      navigate('/consumer-ecommerce/nearby-stores');
    } else if (name === 'Online') {
      setIsOnlineMode(true);
      setSelectedCategory(null);
      setViewMode('explore');
      updateURLParams({ category: '', city: '', mode: 'explore' });
    } else {
      const foundCat = categories.find(c => c.name === name || c.name.startsWith(name));
      if (foundCat) {
        setSelectedCategory(foundCat);
        setViewMode('list');
        updateURLParams({ category: foundCat.name, mode: 'list' });
      }
    }
  };

  // Section rearrangement algorithm (Requirement 4)
  const sectionOrder = useMemo(() => {
    if (isOnlineMode) {
      // online mode emphasizes global categories & featured services
      return ['quick', 'featured', 'categories', 'trending'];
    }
    if (searchQuery) {
      // search query emphasizes trending and categories
      return ['quick', 'trending', 'categories', 'featured', 'states'];
    }
    if (gpsState === 'active') {
      // active GPS bubbles up trending local deals and featured services
      return ['quick', 'trending', 'featured', 'categories', 'states'];
    }
    if (selectedState) {
      // selected state emphasizes cities within that state first
      return ['quick', 'categories', 'featured', 'trending', 'states'];
    }
    // Default arrangement: Quick access icons section first (cities are inside the hero section)
    return ['quick', 'states', 'categories', 'trending', 'featured'];
  }, [isOnlineMode, searchQuery, gpsState, selectedState]);

  // Dynamic listing filters
  const filteredListings = useMemo(() => {
    // Generate actual locations relative to selectedCity center
    let results = listings.map((item, idx) => {
      const baseLat = selectedCity.lat;
      const baseLng = selectedCity.lng;
      // Spread the coordinates around city center
      const lat = baseLat + (item.latOffset || 0.003);
      const lng = baseLng + (item.lngOffset || -0.003);

      // Distance calculation from current center (either GPS or City Center)
      const userLat = userCoords ? userCoords.lat : baseLat;
      const userLng = userCoords ? userCoords.lng : baseLng;
      const distance = getDistanceInKm(userLat, userLng, lat, lng);

      return {
        ...item,
        lat,
        lng,
        distanceVal: distance,
        distance: isOnlineMode ? 'Global Delivery' : `${distance.toFixed(1)} km`,
      };
    });

    // Filter by category
    if (selectedCategory && selectedCategory.name !== 'More') {
      results = results.filter(item => item.category === selectedCategory.name);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      );
    }

    // Apply Filter Chips
    if (activeFilter === 'Open Now') {
      results = results.filter(item => item.status.toLowerCase().includes('open'));
    } else if (activeFilter === 'Organic') {
      results = results.filter(item => (item.tag || '').toLowerCase().includes('organic'));
    } else if (activeFilter === 'Nearby') {
      results = results.sort((a, b) => a.distanceVal - b.distanceVal);
    } else if (activeFilter === 'Top Rated') {
      results = results.filter(item => parseFloat(item.rating) >= 4.6);
    }

    return results;
  }, [selectedCity, selectedCategory, searchQuery, activeFilter, userCoords, isOnlineMode]);

  // Simulate content load shimmers on filter change
  const triggerShimmerLoading = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsOnlineMode(false);
    triggerShimmerLoading();
    updateURLParams({ city: city.name });
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    // Find the first city matching this state
    const matchedCity = cities.find(c => {
      if (state.name === 'Karnataka') return c.name === 'Bangalore';
      if (state.name === 'Maharashtra') return c.name === 'Mumbai' || c.name === 'Pune';
      if (state.name === 'Telangana') return c.name === 'Hyderabad';
      if (state.name === 'Tamil Nadu') return c.name === 'Chennai';
      if (state.name === 'Delhi NCR') return c.name === 'Delhi';
      if (state.name === 'Goa State') return c.name === 'Goa';
      return false;
    });
    if (matchedCity) {
      setSelectedCity(matchedCity);
      setIsOnlineMode(false);
      updateURLParams({ city: matchedCity.name });
    }
    triggerShimmerLoading();
  };

  const handleCategorySelect = (category) => {
    if (category.name === 'More') {
      setSelectedCategory(null);
      setViewMode('explore');
      updateURLParams({ category: '', mode: 'explore' });
    } else {
      setSelectedCategory(category);
      setViewMode('list');
      triggerShimmerLoading();
      updateURLParams({ category: category.name, mode: 'list' });
    }
  };

  // Render explorer section components in dynamic order
  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'quick':
        return (
          <section key="quick" className="ce-nearme-wire-section">
            <div className="ce-nearme-wire-quick" style={{ margin: '10px 0 0' }}>
              {[
                { name: 'TriZone', icon: LuBuilding2, tone: 'cyan' },
                { name: 'Near Store', icon: LuStore, tone: 'green' },
                { name: 'Online', icon: LuGlobe, tone: 'orange' },
                { name: 'Restaurants', icon: LuUtensils, tone: 'red' },
                { name: 'Hotels', icon: LuHotel, tone: 'blue' },
              ].map(({ name, icon: Icon, tone }) => (
                <button key={name} type="button" onClick={() => handleQuickAction(name)}>
                  <span className={`tone-${tone}`} style={{ background: '#FFFFFF', boxShadow: '0 8px 18px rgba(0, 0, 0, 0.05)', border: '1px solid #F1F1F1' }}><Icon /></span>
                  <strong style={{ color: '#1F2937', fontWeight: '800' }}>{name}</strong>
                </button>
              ))}
            </div>
          </section>
        );

      case 'cities':
        return (
          <section key="cities" className="ce-nearme-wire-section ce-nearme-wire-cities">
            <div className="ce-nearme-wire-section-head">
              <h2>Top Cities</h2>
              <button type="button" onClick={() => setShowLocationModal(true)}>View all</button>
            </div>
            <div className="ce-nearme-city-cards">
              {cities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  className={city.name === selectedCity.name && !isOnlineMode ? 'active' : ''}
                  onClick={() => handleCitySelect(city)}
                >
                  <img src={city.image} alt={city.name} />
                  <span>{city.name}</span>
                  <small>{city.count} places</small>
                </button>
              ))}
            </div>
          </section>
        );

      case 'states':
        return (
          <section key="states" className="ce-nearme-wire-section ce-nearme-section-states">
            <div className="ce-nearme-wire-section-head">
              <h2>Explore States</h2>
            </div>
            <div className="ce-nearme-state-cards">
              {states.map((state) => (
                <button
                  key={state.name}
                  type="button"
                  className={selectedState?.name === state.name ? 'active' : ''}
                  onClick={() => handleStateSelect(state)}
                >
                  <span>{state.name}</span>
                  <small>{state.citiesCount}</small>
                </button>
              ))}
            </div>
          </section>
        );

      case 'categories':
        return (
          <section key="categories" className="ce-nearme-wire-section">
            <h2 className="ce-nearme-wire-title">Popular Categories</h2>
            <div className="ce-nearme-wire-category-grid">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.name} type="button" onClick={() => handleCategorySelect(cat)}>
                    <span className={`tone-${cat.tone}`}><Icon /></span>
                    <strong>{cat.name}</strong>
                  </button>
                );
              })}
            </div>
          </section>
        );

      case 'trending':
        return (
          <section key="trending" className="ce-nearme-wire-section ce-nearme-wire-trending">
            <div className="ce-nearme-wire-section-head">
              <h2>Trending Deals</h2>
            </div>
            <div className="ce-nearme-trend-mini-row">
              {trendingCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className="ce-nearme-trend-mini"
                  onClick={() => handleQuickAction(card.title.split(' ').pop())}
                >
                  <img src={card.image} alt={card.title} />
                  <span>{card.title}</span>
                  <small>{card.offer}</small>
                </button>
              ))}
            </div>
          </section>
        );

      case 'featured':
        return (
          <section key="featured" className="ce-nearme-wire-section">
            <h2 className="ce-nearme-wire-title">Featured Services</h2>
            <div className="ce-nearme-featured-grid">
              {featuredServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.name}
                    type="button"
                    className="ce-nearme-featured-card"
                    onClick={() => handleQuickAction(service.name.split(' ').pop())}
                  >
                    <span className={`tone-${service.tone}`}><Icon /></span>
                    <div>
                      <strong>{service.name}</strong>
                      <small>{service.copy}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ce-app ce-nearme-wire">
      {/* 1. Explore Dashboard viewMode === 'explore' */}
      {viewMode === 'explore' && !selectedCategory && (
        <main className="ce-nearme-wire-shell">
          <section className="ce-nearme-wire-hero">
            <div className="ce-nearme-wire-hero-bg" />
            <header className="ce-nearme-wire-top">
              <button
                type="button"
                className="ce-nearme-wire-menu"
                aria-label="Filter Mode Menu"
                onClick={() => setShowLocationModal(true)}
              >
                <LuCompass />
              </button>
              <div>
                <h1>Explore Nearby</h1>
                <p>{isOnlineMode ? 'Global Online Services' : 'Experiences around you'}</p>
              </div>
              <button
                type="button"
                className="ce-nearme-wire-location"
                onClick={() => setShowLocationModal(true)}
              >
                <LuMapPin />
                <span>{isOnlineMode ? 'Global / Online' : selectedCity.name}</span>
                <LuChevronDown />
              </button>
            </header>

            {/* Simulated GPS Fallback banner */}
            {gpsState === 'denied' && (
              <div className="ce-nearme-gps-status denied" style={{ margin: '14px 18px 0' }}>
                <LuShieldAlert />
                <span>{gpsMessage}</span>
              </div>
            )}
            {gpsState === 'active' && (
              <div className="ce-nearme-gps-status active" style={{ margin: '14px 18px 0' }}>
                <LuNavigation />
                <span>{gpsMessage} ({selectedCity.name} Center)</span>
              </div>
            )}
            <label className="ce-nearme-wire-search">
              <LuSearch />
              <input
                placeholder="Search local farmers, shops, salons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer' }}
                >
                  <LuX />
                </button>
              )}
            </label>

            {/* Top Cities Horizontal Cards inside Hero */}
            {!isOnlineMode && (
              <div
                className="ce-nearme-wire-section ce-nearme-wire-cities"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '16px 18px 18px',
                }}
              >
                <div className="ce-nearme-wire-section-head">
                  <h2 style={{ color: '#FFFFFF', fontSize: '15px' }}>Top Cities</h2>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    style={{ color: '#FF8F3A', fontSize: '11px', fontWeight: '800', border: 0, background: 'transparent', cursor: 'pointer' }}
                  >
                    View all
                  </button>
                </div>
                <div className="ce-nearme-city-cards">
                  {cities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      className={city.name === selectedCity.name ? 'active' : ''}
                      onClick={() => handleCitySelect(city)}
                    >
                      <img src={city.image} alt={city.name} />
                      <span>{city.name}</span>
                      <small style={{ color: 'rgba(255, 255, 255, 0.75)' }}>{city.count} places</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Render Sections dynamically ordered */}
          {loading ? (
            <div style={{ padding: '20px' }}>
              <div className="ce-nearme-shimmer" style={{ height: '140px', marginBottom: '20px' }} />
              <div className="ce-nearme-shimmer" style={{ height: '80px', marginBottom: '20px' }} />
              <div className="ce-nearme-shimmer" style={{ height: '220px' }} />
            </div>
          ) : (
            sectionOrder.map((section) => renderSection(section))
          )}
        </main>
      )}

      {/* 2. Listing View: Category filter lists or Active Search results */}
      {((viewMode === 'list' && selectedCategory) || (viewMode === 'explore' && searchQuery.trim())) && (
        <main className="ce-nearme-list-shell">
          <header className="ce-nearme-list-head">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setViewMode('explore');
                updateURLParams({ category: '', mode: 'explore' });
              }}
              aria-label="Back to explore dashboard"
            >
              <LuArrowLeft />
            </button>
            <div>
              <h1>
                {selectedCategory ? selectedCategory.name : 'Search Results'} in{' '}
                {isOnlineMode ? 'Global / Online' : selectedCity.name}
              </h1>
              <p>{filteredListings.length} locations available</p>
            </div>
            <button type="button" aria-label="Open Filters Mode" onClick={() => setShowLocationModal(true)}>
              <LuFilter />
            </button>
          </header>

          <section className="ce-nearme-list-filters" aria-label="Filter Chips">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={filter === activeFilter ? 'active' : ''}
                onClick={() => {
                  setActiveFilter(filter);
                  triggerShimmerLoading();
                }}
              >
                {filter}
              </button>
            ))}
          </section>

          {loading ? (
            <div style={{ padding: '0 16px' }}>
              {[1, 2, 3].map(n => (
                <div key={n} className="ce-nearme-shimmer" style={{ height: '118px', marginBottom: '14px', borderRadius: '18px' }} />
              ))}
            </div>
          ) : (
            <section className="ce-nearme-business-list">
              {filteredListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <LuInfo style={{ width: '40px', height: '40px', marginBottom: '10px' }} />
                  <p>No listings found matching the criteria.</p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <Link
                    key={listing.name}
                    to={`/consumer-ecommerce/nearby-stores?business=${slug(listing.name)}`}
                    className="ce-nearme-business-card"
                  >
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
                        <em>{listing.tag || 'Service'}</em>
                        <b>{listing.offer}</b>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </section>
          )}
        </main>
      )}

      {/* 3. Simulated Map View mode */}
      {viewMode === 'map' && (
        <main className="ce-nearme-map-container">
          <div className="ce-nearme-map-canvas">
            {/* Interactive SVG map canvas representing styled streets, river, parks */}
            <svg width="100%" height="100%" style={{ background: '#E2E8F0' }} aria-label="Interactive Discovery Map">
              {/* Rivers */}
              <path d="M 0 100 Q 150 180 300 120 T 430 200" fill="none" stroke="#93C5FD" strokeWidth="24" opacity="0.6" />
              {/* Parks */}
              <rect x="30" y="240" width="120" height="90" rx="10" fill="#BBF7D0" opacity="0.6" />
              <rect x="260" y="80" width="130" height="100" rx="14" fill="#BBF7D0" opacity="0.6" />
              {/* Grid Roads */}
              <line x1="60" y1="0" x2="60" y2="600" stroke="#F1F5F9" strokeWidth="8" />
              <line x1="200" y1="0" x2="200" y2="600" stroke="#F1F5F9" strokeWidth="10" />
              <line x1="360" y1="0" x2="360" y2="600" stroke="#F1F5F9" strokeWidth="8" />
              <line x1="0" y1="120" x2="430" y2="120" stroke="#F1F5F9" strokeWidth="8" />
              <line x1="0" y1="300" x2="430" y2="300" stroke="#F1F5F9" strokeWidth="10" />
              <line x1="0" y1="460" x2="430" y2="460" stroke="#F1F5F9" strokeWidth="8" />

              {/* Diagonal Highway */}
              <line x1="0" y1="400" x2="430" y2="50" stroke="#E2E8F0" strokeWidth="12" />
              <line x1="0" y1="400" x2="430" y2="50" stroke="#F8FAFC" strokeWidth="6" />
            </svg>

            {/* User simulated GPS dot */}
            <div className="ce-nearme-map-user-dot" style={{ top: '62%', left: '46%' }} />

            {/* Rendering Dynamic Map Pins */}
            {filteredListings.map((listing, idx) => {
              // Distribute pins across coordinates translated to visual grid percentage
              const mapX = 18 + ((listing.latOffset || 0) * 12000 + 40) % 70;
              const mapY = 25 + ((listing.lngOffset || 0) * 12000 + 40) % 55;
              const isActive = activeMapListing?.name === listing.name;

              return (
                <div
                  key={listing.name}
                  className={`ce-nearme-map-pin ${isActive ? 'active' : ''}`}
                  style={{ top: `${mapY}%`, left: `${mapX}%` }}
                  onClick={() => setActiveMapListing(listing)}
                >
                  <div className="ce-nearme-map-pin-pulse" />
                  <LuMapPin size={isActive ? 38 : 28} color={isActive ? '#FF5A00' : '#1E293B'} />
                </div>
              );
            })}
          </div>

          {/* Map floating controls */}
          <div className="ce-nearme-map-controls">
            <button
              type="button"
              onClick={() => {
                setViewMode('explore');
                updateURLParams({ mode: 'explore' });
              }}
              aria-label="Back to explore mode"
            >
              <LuArrowLeft />
            </button>
            <button type="button" onClick={() => alert('Simulating Zoom In')} aria-label="Zoom In">+</button>
            <button type="button" onClick={() => alert('Simulating Zoom Out')} aria-label="Zoom Out">-</button>
          </div>

          {/* Active Listing Detail popup Card */}
          {activeMapListing && (
            <div className="ce-nearme-map-card-overlay">
              <div className="ce-nearme-business-card" style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setActiveMapListing(null)}
                  style={{ position: 'absolute', top: '10px', right: '10px', border: 0, background: '#F3F4F6', borderRadius: '50%', width: '24px', height: '24px', display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 10 }}
                  aria-label="Close store details"
                >
                  <LuX size={12} />
                </button>
                <img src={activeMapListing.image} alt={activeMapListing.name} />
                <div className="ce-nearme-business-info">
                  <div className="ce-nearme-business-title">
                     <h2>{activeMapListing.name}</h2>
                  </div>
                  <p><LuStar /> {activeMapListing.rating} <span>({activeMapListing.reviews})</span></p>
                  <small>{activeMapListing.category} • {activeMapListing.distance}</small>
                  <strong>{activeMapListing.status}</strong>
                  <div style={{ marginTop: '6px' }}>
                    <Link
                      to={`/consumer-ecommerce/nearby-stores?business=${slug(activeMapListing.name)}`}
                      className="ce-action-cta"
                      style={{ textDecoration: 'none', background: '#FF6B00', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}
                    >
                      Visit Shop
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Floating Map View / List Mode toggle button */}
      {!isOnlineMode && (
        <button
          type="button"
          onClick={() => {
            const nextMode = viewMode === 'map' ? 'explore' : 'map';
            setViewMode(nextMode);
            setActiveMapListing(null);
            updateURLParams({ mode: nextMode });
          }}
          className="ce-nearme-map-float ce-nearme-wire-map"
          style={{ border: 0, cursor: 'pointer', zIndex: 50 }}
        >
          <LuMap />
          {viewMode === 'map' ? 'List View' : 'Map View'}
        </button>
      )}

      {/* 4. Custom Location Selector Modal Overlay */}
      {showLocationModal && (
        <div className="ce-nearme-location-modal" onClick={() => setShowLocationModal(false)}>
          <div className="ce-nearme-location-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ce-nearme-location-modal-header">
              <h2>Select Location</h2>
              <button type="button" onClick={() => setShowLocationModal(false)} aria-label="Close modal">
                <LuX />
              </button>
            </div>

            {/* GPS Simulation button */}
            <button type="button" className="ce-nearme-gps-button" onClick={fetchGPSLocation}>
              <LuNavigation />
              Simulate GPS Location
            </button>

            {gpsState !== 'idle' && (
              <div className={`ce-nearme-gps-status ${gpsState}`}>
                {gpsState === 'fetching' && <LuCompass className="ce-nearme-shimmer" />}
                {gpsState === 'active' && <LuNavigation />}
                {gpsState === 'denied' && <LuShieldAlert />}
                <span>{gpsMessage || 'GPS loading...'}</span>
              </div>
            )}

            {/* Online mode Toggle */}
            <div className="ce-nearme-online-toggle">
              <span>Enable Global Online Mode</span>
              <label className="ce-nearme-switch">
                <input
                  type="checkbox"
                  checked={isOnlineMode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsOnlineMode(checked);
                    if (checked) {
                      setViewMode('explore');
                      updateURLParams({ online: 'true', mode: 'explore' });
                    } else {
                      updateURLParams({ online: null });
                    }
                  }}
                />
                <span className="ce-nearme-slider" />
              </label>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '12px', margin: '0 0 10px', color: '#4B5563' }}>Popular Cities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {cities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: city.name === selectedCity.name && !isOnlineMode ? '#FF6B00' : '#E5E7EB',
                      background: city.name === selectedCity.name && !isOnlineMode ? '#FFF3E6' : '#FFFFFF',
                      color: city.name === selectedCity.name && !isOnlineMode ? '#FF6B00' : '#1F2937',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      handleCitySelect(city);
                      setShowLocationModal(false);
                    }}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '12px', margin: '14px 0 10px', color: '#4B5563' }}>Filter by State</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {states.map((state) => (
                  <button
                    key={state.name}
                    type="button"
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: selectedState?.name === state.name ? '#FF6B00' : '#E5E7EB',
                      background: selectedState?.name === state.name ? '#FFF3E6' : '#FFFFFF',
                      color: selectedState?.name === state.name ? '#FF6B00' : '#1F2937',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      handleStateSelect(state);
                      setShowLocationModal(false);
                    }}
                  >
                    {state.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

