import { useState, useEffect } from 'react';
import Exercise1 from './Exercise1';
import Exercise3 from './Exercise3';
import { fakeFetchProducts } from './data/products';
import ProductCard from './components/ProductCard';

export default function App() {
  const [currentEx, setCurrentEx] = useState('ex1');

  // State for Exercise 2
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fakeFetchProducts().then((data) => {
      setProductList(data);
      setLoading(false);
    });
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    if (currentEx === 'ex2') {
      document.title = `Cart (${totalItems})`;
    } else if (currentEx === 'ex3') {
      document.title = 'Exercise 3: Real Data';
    } else {
      document.title = 'Exercise 1';
    }
  }, [totalItems, currentEx]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const filteredProducts = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      {/* Navigation Bar */}
      <div style={styles.navBar}>
        <button
          onClick={() => setCurrentEx('ex1')}
          style={{
            ...styles.navBtn,
            backgroundColor: currentEx === 'ex1' ? 'var(--accent)' : 'transparent',
          }}
        >
          Exercise 1
        </button>
        <button
          onClick={() => setCurrentEx('ex2')}
          style={{
            ...styles.navBtn,
            backgroundColor: currentEx === 'ex2' ? 'var(--accent)' : 'transparent',
          }}
        >
          Exercise 2
        </button>
        <button
          onClick={() => setCurrentEx('ex3')}
          style={{
            ...styles.navBtn,
            backgroundColor: currentEx === 'ex3' ? 'var(--accent)' : 'transparent',
          }}
        >
          Exercise 3
        </button>
      </div>

      {/* Render selected Exercise */}
      {currentEx === 'ex1' && <Exercise1 />}

      {currentEx === 'ex2' && (
        <div style={styles.container}>
          <div style={styles.shop}>
            <h1 style={styles.heading}>Shop (Exercise 2)</h1>

            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Categories</option>
                <option value="Accessories">Accessories</option>
                <option value="Displays">Displays</option>
                <option value="Computers">Computers</option>
              </select>
            </div>

            {loading ? (
              <h3>Loading...</h3>
            ) : (
              <div style={styles.grid}>
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    name={p.name}
                    price={p.price}
                    inStock={p.inStock}
                    onAddToCart={() => addToCart(p)}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={styles.cartContainer}>
            <h2 style={styles.cartTitle}>Cart</h2>
            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-sub)', margin: 0 }}>Your cart is empty.</p>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                          {item.name}{' '}
                          <span style={{ color: 'var(--accent)' }}>x {item.quantity}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '2px' }}>
                          {item.price * item.quantity} USD
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '16px 0' }} />
                <h3 style={{ margin: 0, color: 'var(--accent)', textAlign: 'right' }}>
                  Total: {totalPrice} USD
                </h3>
              </div>
            )}
          </div>
        </div>
      )}

      {currentEx === 'ex3' && <Exercise3 />}
    </div>
  );
}

const styles = {
  navBar: {
    display: 'flex',
    gap: '12px',
    padding: '16px 40px',
    borderBottom: '1px solid var(--card-border)',
    backgroundColor: 'var(--card-bg)',
  },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
  },
  container: {
    display: 'flex',
    gap: '32px',
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  shop: {
    flex: 3,
  },
  cartContainer: {
    flex: 1,
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '24px',
    height: 'fit-content',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  heading: {
    margin: '0 0 24px 0',
    color: 'var(--text-main)',
    fontSize: '32px',
  },
  cartTitle: {
    margin: '0 0 20px 0',
    color: 'var(--text-main)',
    fontSize: '22px',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    flex: 1,
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  removeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
};