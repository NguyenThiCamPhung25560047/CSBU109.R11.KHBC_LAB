const PLACEHOLDER = 'https://via.placeholder.com/150?text=No+image';

export default function ProductCard({
  name,
  price,
  inStock = true,
  image = PLACEHOLDER,
  onAddToCart
}) {
  return (
    <div style={styles.card}>
      {price < 20 && <span style={styles.badge}>Low price!</span>}
      <img src={image} alt={name} style={styles.image} />
      <div style={styles.content}>
        <h3 style={styles.title}>{name}</h3>
        <p style={styles.price}>{price.toLocaleString()} USD</p>
        {inStock ? (
          <span style={styles.stockIn}>In stock</span>
        ) : (
          <span style={styles.stockOut}>Sold out</span>
        )}
        {onAddToCart && (
          <button
            onClick={onAddToCart}
            disabled={!inStock}
            style={styles.btn}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '16px',
    width: '210px',
    position: 'relative',
    backgroundColor: 'var(--card-bg)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  badge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
    borderRadius: '10px',
    backgroundColor: '#334155',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '12px',
    gap: '6px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  price: {
    margin: 0,
    color: 'var(--text-sub)',
    fontWeight: '500',
    fontSize: '14px',
  },
  stockIn: {
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    width: 'fit-content',
    margin: '4px 0 8px 0',
  },
  stockOut: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    width: 'fit-content',
    margin: '4px 0 8px 0',
  },
  btn: {
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'opacity 0.2s',
  },
};