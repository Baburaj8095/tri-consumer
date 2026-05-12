export default function ProductCard({ product }) {
  const discountText = product.discount.toLowerCase();
  const percentage = discountText.split(' ')[0] || '50%';

  return (
    <article className="ce-product-card">
      <div className="ce-product-img-wrap">
        <img src={product.image} alt={product.name} />
        <div className="ce-product-badge">{percentage} OFF</div>
      </div>
      <div className="ce-product-meta">
        <h3 className="ce-product-title">{product.name}</h3>
        <div className="ce-product-price-row">
          <span className="ce-product-price">{product.newPrice}</span>
          <span className="ce-product-old">{product.oldPrice}</span>
        </div>
      </div>
    </article>
  );
}
