import { Link } from 'react-router-dom';
import { LuChevronDown, LuMapPin, LuSearch } from 'react-icons/lu';
import { consumerProfile } from '../services/mockData.js';

export default function SearchBar({ onSearch }) {
  // Use pincode from mock profile or fallback to 560091
  const pincode = consumerProfile?.pinCode || '560091';

  return (
    <div className="ce-search-button">
      <button type="button" onClick={onSearch} className="ce-search-main">
        <span className="ce-location-dot"><LuMapPin /></span>
        <span className="ce-search-placeholder">Deliver to {pincode}</span>
        <LuChevronDown className="ce-search-chevron" />
      </button>
      <Link to="/consumer-ecommerce/join-prime" className="ce-prime-pill">
        <LuSearch />
        Search
      </Link>
    </div>
  );
}
