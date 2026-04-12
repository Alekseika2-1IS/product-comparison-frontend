import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import { getCurrentUser, isAdmin, logout } from '../services/authService';
import { addToCart } from '../services/cartService';
import { getProductRating } from "../services/ratingsService";
import ProductCard from '../components/ProductCard/ProductCard';
import ProductForm from '../components/ProductForm/ProductForm';
import AuthForm from '../components/Auth/AuthForm';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = localStorage.getItem('selectedIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
  const [ratings, setRatings] = useState({});
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
      const ratingsData = {};
      for (const product of response.data) {
        const info = getProductRating(product.id);
        ratingsData[product.id] = info.average;
      }
      setRatings(ratingsData);
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
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditClick = (product) => {
    if (!isAdmin()) {
      alert('Только администратор может редактировать товары');
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!isAdmin()) {
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
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    addToCart(product, 1);
    alert(`${product.name} добавлен в корзину`);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate('/');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  return (
    <div>
      <button onClick={handleAddClick} style={{ marginBottom: '20px' }}>+ Добавить товар</button>

      <div style={{ marginBottom: '20px' }}>
        <span>Выбрано: {selectedIds.length} товаров</span>
        <button onClick={handleCompare} disabled={selectedIds.length < 2}>Сравнить ({selectedIds.length})</button>
        {selectedIds.length > 0 && <button onClick={handleClear}>Очистить выбор</button>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {products.map(product => (
          <div key={product.id} style={{ position: 'relative', width: '240px' }}>
            <ProductCard
              product={product}
              onSelect={handleSelect}
              isSelected={selectedIds.includes(product.id)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddToCart={handleAddToCart}
              user={currentUser}
            />
          </div>
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