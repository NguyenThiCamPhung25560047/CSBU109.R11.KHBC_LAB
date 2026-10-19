import ProductCard from './components/ProductCard';

const products = [
  { id: 1, name: 'Keyboard', price: 25, inStock: true },
  { id: 2, name: 'Mouse', price: 12, inStock: false },
  { id: 3, name: 'Monitor', price: 180, inStock: true },
];

export default function Exercise1() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-main)', marginBottom: '24px' }}>
        Products
      </h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {products.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            price={p.price}
            inStock={p.inStock}
          />
        ))}
      </div>
    </div>
  );
}