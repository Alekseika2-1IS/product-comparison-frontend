import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductForm from '../components/ProductForm/ProductForm';

// Главная страница каталога товаров
const CatalogPage = () => {
  const [products, setProducts] = useState([]);          // все товары
  const [selectedIds, setSelectedIds] = useState([]);    // id выбранных для сравнения
  const [showForm, setShowForm] = useState(false);       // показывать ли форму
  const [editingProduct, setEditingProduct] = useState(null); // товар для редактирования (null = добавление)
  const navigate = useNavigate();

  // Загрузка товаров при монтировании компонента
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      alert('Не удалось загрузить товары. Проверьте подключение к серверу.');
    }
  };

  // Обработка выбора товара (чекбокс)
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

  // Переход на страницу сравнения
  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      navigate('/compare', { state: { selectedIds } });
    } else {
      alert('Выберите минимум 2 товара для сравнения');
    }
  };

  // Сброс выбора
  const handleClear = () => {
    setSelectedIds([]);
  };

  // Открыть форму добавления товара
  const handleAddClick = () => {
    setEditingProduct(null);   // явно указываем, что это добавление
    setShowForm(true);
  };

  // Открыть форму редактирования товара
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Удалить товар
  const handleDeleteClick = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct(id);
        // Обновляем список товаров, удаляя удалённый
        setProducts(products.filter(p => p.id !== id));
        // Если удалённый товар был выбран, убираем его из selectedIds
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Не удалось удалить товар. Проверьте подключение к серверу.');
      }
    }
  };

  // Обработчик сохранения товара (после добавления или редактирования)
  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
      // Редактирование: заменяем старый товар на обновлённый
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    } else {
      // Добавление: добавляем новый товар в список (json-server возвращает созданный объект с id)
      setProducts([...products, savedProduct]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Каталог товаров</h1>
      
      {/* Кнопка добавления товара */}
      <button 
        onClick={handleAddClick}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        + Добавить товар
      </button>

      {/* Панель управления сравнением */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '16px' }}>Выбрано: {selectedIds.length} товаров</span>
        <button 
          onClick={handleCompare} 
          disabled={selectedIds.length < 2}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedIds.length < 2 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedIds.length < 2 ? 'not-allowed' : 'pointer'
          }}
        >
          Сравнить ({selectedIds.length})
        </button>
        {selectedIds.length > 0 && (
          <button 
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Очистить выбор
          </button>
        )}
      </div>

      {/* Сетка карточек товаров */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
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

      {/* Модальное окно формы */}
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