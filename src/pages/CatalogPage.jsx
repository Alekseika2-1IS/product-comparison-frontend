import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductForm from '../components/ProductForm/ProductForm';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  // Инициализируем selectedIds из localStorage (если там есть сохранённые)
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = localStorage.getItem('selectedIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  // Загружаем товары при монтировании
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

  // Сохраняем выбранные ID в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds]);

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

  const handleClear = () => {
    setSelectedIds([]);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        // Удаляем ID из выбранных, если он там был
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Не удалось удалить товар');
      }
    }
  };

  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    } else {
      setProducts([...products, savedProduct]);
    }
  };

  return (
    <div>
      <h1>Каталог товаров</h1>
      <button onClick={handleAddClick} style={{ marginBottom: '20px' }}>
        + Добавить товар
      </button>

      <div style={{ marginBottom: '20px' }}>
        <span>Выбрано: {selectedIds.length} товаров</span>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          style={{ marginLeft: '10px' }}
        >
          Сравнить ({selectedIds.length})
        </button>
        {selectedIds.length > 0 && (
          <button onClick={handleClear} style={{ marginLeft: '10px' }}>
            Очистить выбор
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleSelect}
            isSelected={selectedIds.includes(product.id)}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {showForm && (
        <ProductForm
          productToEdit={editingProduct}
          onClose={() => setShowForm(false)}
          onProductSaved={handleProductSaved}
        />
      )}
    </div>
  );
};

export default CatalogPage;