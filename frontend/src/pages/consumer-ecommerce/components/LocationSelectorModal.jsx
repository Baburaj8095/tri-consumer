import { HiOutlineMapPin, HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import { citySuggestions } from '../services/mockData.js';

export default function LocationSelectorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="ce-modal-backdrop">
      <div className="ce-modal">
        <div className="ce-modal-head">
          <h2 className="ce-modal-title">Select your city</h2>
          <button className="ce-icon-btn ce-icon-btn-sm" onClick={onClose} aria-label="Close city selector">
            <HiOutlineXMark />
          </button>
        </div>
        <label className="ce-modal-search">
          <HiOutlineMagnifyingGlass className="ce-primary-text" />
          <input className="ce-input" autoFocus placeholder="Search city, area, or landmark" />
        </label>
        <button className="ce-current-location">
          <HiOutlineMapPin />
          Use current location
        </button>
        <div className="ce-popular-wrap">
          <p className="ce-popular-label">Popular cities</p>
          <div className="ce-city-grid">
            {citySuggestions.map((city) => (
              <button key={city} onClick={onClose} className="ce-city-btn">
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
