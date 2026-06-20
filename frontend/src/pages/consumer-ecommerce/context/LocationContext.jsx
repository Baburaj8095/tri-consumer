import React, { createContext, useContext, useState, useEffect } from 'react';

// Haversine Distance Formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmFidXJhaiIsImEiOiJjbHpia2I5YTIwMDFrMmpzNmtxM3d2N280In0.yourmocktoken';

// Default Location (Bangalore / Indiranagar)
const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
  area: 'Indiranagar',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  pincode: '560038',
  formattedAddress: 'Indiranagar, Bangalore, Karnataka, India',
};

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem('triConsumerLocation');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch (_) {
      return DEFAULT_LOCATION;
    }
  });

  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('triConsumerRecentLocations');
      return saved ? JSON.parse(saved) : [
        { ...DEFAULT_LOCATION, id: '1' },
        { ...DEFAULT_LOCATION, area: 'Whitefield', pincode: '560066', formattedAddress: 'Whitefield, Bangalore', id: '2' },
        { ...DEFAULT_LOCATION, area: 'Koramangala', pincode: '560034', formattedAddress: 'Koramangala, Bangalore', id: '3' }
      ];
    } catch (_) {
      return [];
    }
  });

  const [showPrompt, setShowPrompt] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('triConsumerLocation');
    if (!saved) {
      setShowPrompt(true);
    }
  }, []);

  const saveLocation = (loc) => {
    setLocationState(loc);
    localStorage.setItem('triConsumerLocation', JSON.stringify(loc));

    // Update recents
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (x) => x.area?.toLowerCase() !== loc.area?.toLowerCase() || x.city?.toLowerCase() !== loc.city?.toLowerCase()
      );
      const updated = [{ ...loc, id: String(Date.now()) }, ...filtered].slice(0, 5);
      localStorage.setItem('triConsumerRecentLocations', JSON.stringify(updated));
      return updated;
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        let area = feature.text || '';
        let city = 'Bangalore';
        let state = 'Karnataka';
        let country = 'India';
        let pincode = '';

        context.forEach((item) => {
          if (item.id.startsWith('postcode')) {
            pincode = item.text;
          } else if (item.id.startsWith('place')) {
            city = item.text;
          } else if (item.id.startsWith('region')) {
            state = item.text;
          } else if (item.id.startsWith('country')) {
            country = item.text;
          } else if (item.id.startsWith('locality') || item.id.startsWith('neighborhood')) {
            area = item.text;
          }
        });

        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = feature.text || 'Indiranagar';
        }

        const formattedAddress = `${area}, ${city}`;

        return {
          lat,
          lng,
          area,
          city,
          state,
          country,
          pincode,
          formattedAddress
        };
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }

    return {
      lat,
      lng,
      area: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560038',
      formattedAddress: 'Indiranagar, Bangalore'
    };
  };

  const getGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const loc = await reverseGeocode(latitude, longitude);
            saveLocation(loc);
            resolve(loc);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  };

  const handleUseCurrentLocation = async () => {
    setShowPrompt(false);
    try {
      await getGPSLocation();
    } catch (err) {
      console.error('Failed to get GPS location:', err);
      saveLocation(DEFAULT_LOCATION);
      alert('Could not obtain current location. Using default location.');
    }
  };

  const handleChooseManually = () => {
    setShowPrompt(false);
    setShowPicker(true);
  };

  const searchLocations = async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=5&autocomplete=true`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.features) {
        return data.features.map((feature) => {
          const context = feature.context || [];
          let city = '';
          let pincode = '';
          context.forEach((item) => {
            if (item.id.startsWith('place')) city = item.text;
            if (item.id.startsWith('postcode')) pincode = item.text;
          });
          
          return {
            id: feature.id,
            formattedAddress: feature.place_name,
            area: feature.text,
            city: city || 'Bangalore',
            pincode: pincode,
            lat: feature.center[1],
            lng: feature.center[0]
          };
        });
      }
    } catch (err) {
      console.error('Error fetching Mapbox autocomplete:', err);
    }

    const mockSuggestions = [
      { id: 'm1', formattedAddress: `${query}, Indiranagar, Bangalore`, area: query, city: 'Bangalore', pincode: '560038', lat: 12.9716, lng: 77.5946 },
      { id: 'm2', formattedAddress: `${query}, Whitefield, Bangalore`, area: query, city: 'Bangalore', pincode: '560066', lat: 12.9698, lng: 77.7499 },
      { id: 'm3', formattedAddress: `${query}, Koramangala, Bangalore`, area: query, city: 'Bangalore', pincode: '560034', lat: 12.9352, lng: 77.6244 },
      { id: 'm4', formattedAddress: `${query}, Jubilee Hills, Hyderabad`, area: query, city: 'Hyderabad', pincode: '500033', lat: 17.4326, lng: 78.4071 },
      { id: 'm5', formattedAddress: `${query}, Bandra West, Mumbai`, area: query, city: 'Mumbai', pincode: '400050', lat: 19.0596, lng: 72.8295 }
    ];
    return mockSuggestions.filter(item => item.formattedAddress.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        recentLocations,
        getGPSLocation,
        reverseGeocode,
        searchLocations,
        saveLocation,
        setShowPicker,
        showPicker,
      }}
    >
      {children}

      {/* FIRST LOGIN LOCATION PROMPT MODAL */}
      {showPrompt && (
        <div className="location-prompt-overlay">
          <div className="location-prompt-card">
            <div className="location-prompt-icon">📍</div>
            <h3>Allow Location Access?</h3>
            <p>We need your location to show nearby marketplace shops, calculate delivery distances, and enable local services.</p>
            <div className="location-prompt-buttons">
              <button className="btn-primary" onClick={handleUseCurrentLocation}>
                Use Current Location
              </button>
              <button className="btn-secondary" onClick={handleChooseManually}>
                Choose Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
