import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import { addToCart } from '../services/cartService';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductForm from '../components/ProductForm/ProductForm';
import AuthForm from '../components/Auth/AuthForm';

const CatalogPage = ({ user }) => {   // <-- получаем user из пропсов (из App.jsx)
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = localStorage.getItem('selectedIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

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
    if (!user) {
      setShowAuth(true);
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditClick = (product) => {
    if (!user || user.role !== 'admin') {
      alert('Только администратор может редактировать товары');
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!user || user.role !== 'admin') {
      alert('Только администратор может удалять товары');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
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
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    addToCart(product, 1);
    alert(`${product.name} добавлен в корзину`);
  };

  const handleAuthSuccess = (loggedInUser) => {
    setShowAuth(false);
    // Пользователь уже обновится в App.jsx через пропс, но для локального обновления можно вызвать navigate(0) или просто закрыть окно
    window.location.reload(); // проще перезагрузить, чтобы App.jsx подхватил нового пользователя
  };

  return (
    <div>
      <button onClick={handleAddClick} style={{ marginBottom: '20px' }}>
        + Добавить товар
      </button>

      <div style={{ marginBottom: '20px' }}>
        <span>Выбрано: {selectedIds.length} товаров</span>
        <button onClick={handleCompare} disabled={selectedIds.length < 2}>
          Сравнить ({selectedIds.length})
        </button>
        {selectedIds.length > 0 && <button onClick={handleClear}>Очистить выбор</button>}
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
            onAddToCart={handleAddToCart}
            user={user}
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

      {showAuth && <AuthForm onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default CatalogPage;