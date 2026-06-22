import React, { useState, useEffect } from 'react';
import { LuMapPin, LuX, LuSearch, LuClock } from 'react-icons/lu';
import { useLocation } from '../context/LocationContext';


export default function LocationPickerModal({ isOpen, onClose }) {
  const {
    location,
    recentLocations,
    getGPSLocation,
    searchLocations,
    saveLocation,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(searchQuery, controller.signal);
        setSearchResults(results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [searchQuery, searchLocations]);

  if (!isOpen) return null;

  const handleUseCurrentLocation = async () => {
    try {
      await getGPSLocation();
      onClose();
    } catch (err) {
      alert('Could not obtain current location. Please choose manually.');
    }
  };

  const handleSelectLocation = (loc) => {
    saveLocation({
      lat: loc.lat,
      lng: loc.lng,
      area: loc.area || loc.formattedAddress?.split(',')[0] || 'Selected Area',
      city: loc.city || 'Bangalore',
      state: loc.state || 'Karnataka',
      country: loc.country || 'India',
      pincode: loc.pincode || '',
      formattedAddress: loc.formattedAddress || `${loc.area}, ${loc.city}`
    });
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const popularCities = [
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 }
  ];

  return (
    <div className="location-picker-overlay" onClick={onClose}>
      <div className="location-picker-card" onClick={(e) => e.stopPropagation()}>
        <div className="location-picker-header">
          <h3>Select Location</h3>
          <button className="location-picker-close" onClick={onClose} aria-label="Close modal">
            <LuX size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="location-picker-search">
          <LuSearch size={20} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search Area, Pincode or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Autocomplete Results */}
        {searchResults.length > 0 && (
          <ul className="location-picker-results" aria-label="Search results">
            {searchResults.map((result) => (
              <li
                key={result.id}
                className="location-picker-result-item"
                onClick={() => handleSelectLocation(result)}
              >
                <LuMapPin size={18} color="#f97316" />
                <div>
                  <strong>{result.area}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                    {result.formattedAddress}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '13px', color: '#f97316' }}>
            Searching locations...
          </div>
        )}

        {/* Use Current Location Button */}
        <button className="location-picker-current" onClick={handleUseCurrentLocation}>
          <LuMapPin size={18} />
          Use Current Location
        </button>

        {/* Recent Locations */}
        {recentLocations.length > 0 && (
          <>
            <h4 className="location-picker-section-title">Recent Locations</h4>
            <div className="location-picker-recents" role="list">
              {recentLocations.map((loc) => (
                <button
                  key={loc.id}
                  className="location-picker-recent-item"
                  onClick={() => handleSelectLocation(loc)}
                >
                  <LuClock size={16} color="#94a3b8" />
                  <div>
                    <strong>{loc.area}</strong>
                    <span>{loc.city} • {loc.pincode || 'No Pincode'}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Popular Locations */}
        <h4 className="location-picker-section-title">Popular Cities</h4>
        <div className="location-picker-popular-grid">
          {popularCities.map((city) => (
            <button
              key={city.name}
              className="location-picker-popular-btn"
              onClick={() =>
                handleSelectLocation({
                  lat: city.lat,
                  lng: city.lng,
                  area: city.name,
                  city: city.name,
                  formattedAddress: `${city.name}, India`
                })
              }
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
