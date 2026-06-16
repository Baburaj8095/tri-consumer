import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  LuChevronLeft,
  LuSearch,
  LuStore,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import NearbyStoreCard from '../components/NearbyStoreCard.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = 'https://api-captain.trikonektbusiness.com/api';

export default function NearbyStoresPage() {
  const [b2cShops, setB2cShops] = useState([]);

  useEffect(() => {
    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        const data = res.data || [];
        setB2cShops(data.map(shop => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'B2C Merchant',
          category: 'Retail Store',
          rating: '4.5',
          location: shop.city || shop.address || 'Local Area',
          distance: 'Nearby',
          status: 'Open now',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        })));
      })
      .catch(err => console.error('Failed to load B2C merchants:', err));
  }, []);

  return (
    <div className="ce-app ce-nearby-page">
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Nearby Stores</h1>
          <p>Stores around Indiranagar</p>
        </div>
        <span><LuStore /></span>
      </header>

      <main className="ce-nearby-shell">
        <section className="ce-nearby-content" style={{ paddingLeft: 16 }}>
          <label className="ce-nearby-search">
            <LuSearch />
            <input placeholder="Search nearby stores" />
          </label>

          <div className="ce-nearby-heading">
            <h2>Stores near you</h2>
            <span>{b2cShops.length} found</span>
          </div>

          <div className="ce-nearby-store-list">
            {b2cShops.map((store) => (
              <NearbyStoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
