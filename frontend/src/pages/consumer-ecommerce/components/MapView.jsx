import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMapPin, LuStar, LuX, LuCompass } from 'react-icons/lu';
import { useLocation } from '../context/LocationContext';

export default function MapView({ stores }) {
  const navigate = useNavigate();
  const { location: userLoc } = useLocation();
  const [selectedStore, setSelectedStore] = useState(null);

  // Generate mock coordinates on the map view bounding box
  const mapCenterLat = userLoc.lat;
  const mapCenterLng = userLoc.lng;

  // Let's place stores relative to map center for visualization
  const pins = stores.map((store, index) => {
    // Generate slight offsets based on index
    const offsets = [
      { x: 35, y: -45 },
      { x: -50, y: 30 },
      { x: 60, y: 55 },
      { x: -20, y: -70 },
      { x: 75, y: -25 }
    ];
    const offset = offsets[index % offsets.length];
    return {
      ...store,
      x: 50 + offset.x, // relative %
      y: 50 + offset.y
    };
  });

  return (
    <div className="map-view-container" style={{ height: '500px', position: 'relative' }}>
      <div className="map-fallback-view">
        {/* Mock Map Grid and Compass */}
        <div className="map-fallback-grid">
          <LuCompass size={40} style={{ color: '#cbd5e1', opacity: 0.5, transform: 'rotate(25deg)' }} />
        </div>

        {/* User Location Pulsing Dot */}
        <div 
          className="map-pin-mock" 
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 12 
          }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', border: '3.5px solid #fff', boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)' }} />
            <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.25)', animation: 'cePulse 2s infinite' }} />
          </div>
          <div className="map-pin-label" style={{ background: '#3b82f6' }}>You are here</div>
        </div>

        {/* Store Pins */}
        {pins.map((store) => (
          <div
            key={store.id}
            className="map-pin-mock"
            style={{ 
              left: `${store.x}%`, 
              top: `${store.y}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 10
            }}
            onClick={() => setSelectedStore(store)}
          >
            <div className="map-pin-circle">
              <LuMapPin size={16} />
            </div>
            <div className="map-pin-label">{store.name}</div>
          </div>
        ))}

        {/* Active Store Popup Details Overlay */}
        {selectedStore && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '16px', 
              left: '16px', 
              right: '16px', 
              background: '#fff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              padding: '16px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 15,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>{selectedStore.name}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{selectedStore.category || 'Retail Store'}</p>
              </div>
              <button 
                onClick={() => setSelectedStore(null)} 
                style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycenter: 'center', cursor: 'pointer' }}
                aria-label="Close details"
              >
                <LuX size={14} style={{ margin: 'auto' }} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#f97316' }}>
                ⭐ {selectedStore.rating || '4.5'}
              </span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Open Now</span>
              <span style={{ fontWeight: 600, color: '#475569' }}>{selectedStore.distance || '0.8 KM Away'}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.open(`tel:${selectedStore.phone || '08095918105'}`)}
                style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
              >
                Call
              </button>
              <button
                onClick={() => navigate(`/consumer-ecommerce/shop/${selectedStore.shopId || selectedStore.id}`)}
                style={{ flex: 1.5, height: '40px', borderRadius: '8px', border: 'none', background: '#f97316', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                View Store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
