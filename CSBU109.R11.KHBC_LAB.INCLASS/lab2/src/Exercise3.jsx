import { useState, useEffect } from 'react';
import { getProducts, getProductById } from './services/productApi';

export default function Exercise3() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Selected product details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const LIMIT = 12;

  // Fetch product list with pagination
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const skip = (page - 1) * LIMIT;
    getProducts(LIMIT, skip, controller.signal)
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  // Click product to fetch details
  const handleProductClick = async (id) => {
    setDetailLoading(true);
    try {
      const details = await getProductById(id);
      setSelectedProduct(details);
    } catch (err) {
      alert('Failed to load product details');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h1 style={styles.heading}>Products (DummyJSON)</h1>

        {loading && <h3 style={{ color: 'var(--text-sub)' }}>Loading...</h3>}
        {error && <h3 style={{ color: '#ef4444' }}>Error: {error}</h3>}

        {!loading && !error && (
          <>
            <div style={styles.grid}>
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.id)}
                  style={styles.card}
                >
                  <img src={p.thumbnail} alt={p.title} style={styles.thumbnail} />
                  <h4 style={styles.title}>{p.title}</h4>
                  <p style={styles.price}>${p.price}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={styles.pageBtn}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Product Detail Sidebar */}
      {selectedProduct && (
        <div style={styles.detailSidebar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>
              {selectedProduct.title}
            </h2>
            <button
              onClick={() => setSelectedProduct(null)}
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>

          {detailLoading ? (
            <p>Loading details...</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <img
                src={selectedProduct.thumbnail}
                alt={selectedProduct.title}
                style={styles.detailImage}
              />
              <p style={{ color: 'var(--text-sub)', fontSize: '14px', lineHeight: '1.5' }}>
                {selectedProduct.description}
              </p>
              <p style={styles.detailMeta}>
                <strong>Price:</strong> ${selectedProduct.price}
              </p>
              <p style={styles.detailMeta}>
                <strong>Rating:</strong> {selectedProduct.rating} / 5
              </p>
              <p style={styles.detailMeta}>
                <strong>Stock:</strong> {selectedProduct.stock}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '32px',
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  mainContent: {
    flex: 2,
  },
  heading: {
    margin: '0 0 24px 0',
    color: 'var(--text-main)',
    fontSize: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  thumbnail: {
    width: '100%',
    height: '130px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  title: {
    margin: '12px 0 6px 0',
    color: 'var(--text-main)',
    fontSize: '15px',
  },
  price: {
    margin: 0,
    color: 'var(--accent)',
    fontWeight: '700',
    fontSize: '16px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px',
  },
  pageBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
  },
  detailSidebar: {
    flex: 1,
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '24px',
    height: 'fit-content',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: '20px',
  },
  closeBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'transparent',
    color: 'var(--text-sub)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  detailImage: {
    width: '100%',
    height: '180px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    marginBottom: '16px',
  },
  detailMeta: {
    color: 'var(--text-main)',
    margin: '8px 0',
    fontSize: '14px',
  },
};