import { Link } from 'react-router-dom';

export default function GridProductCard({ product }) {
  return (
    <Link to={`/consumer-ecommerce/product/${product.id}`} className="ce-grid-product-card">
      <div className="ce-grid-img-wrap">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="ce-grid-meta">
        <h3 className="ce-grid-title">{product.name}</h3>
        <div className="ce-grid-price-row">
          <span className="ce-grid-price">{product.newPrice}</span>
          <span className="ce-grid-old">{product.oldPrice}</span>
        </div>
        <span className="ce-grid-discount">{product.discount}</span>
      </div>
    </Link>
  );
}
