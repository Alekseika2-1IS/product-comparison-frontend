import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import { useNavigate } from 'react-router-dom';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleSelect = (id, isChecked) => {
    if (isChecked) {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert('Можно выбрать не более 3 товаров для сравнения');
      }
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      navigate('/compare', { state: { selectedIds } });
    } else {
      alert('Выберите минимум 2 товара для сравнения');
    }
  };

  return (
    <div>
      <h1>Каталог товаров</h1>
      <div style={{ marginBottom: '20px' }}>
        <span>Выбрано: {selectedIds.length} товаров</span>
        <button onClick={handleCompare} disabled={selectedIds.length < 2}>
          Сравнить ({selectedIds.length})
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleSelect}
            isSelected={selectedIds.includes(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;