// Импортируем необходимые хуки из React
import { useEffect, useState } from 'react';
// Хук useNavigate для программной навигации (перехода на другую страницу)
import { useNavigate } from 'react-router-dom';
// Импортируем функцию для получения списка товаров из API
import { getProducts } from '../services/api';
// Импортируем компонент карточки товара
import ProductCard from '../components/ProductCard/ProductCard';

// Компонент страницы каталога товаров
const CatalogPage = () => {
  // Состояние для хранения массива всех товаров, полученных с сервера
  const [products, setProducts] = useState([]);
  // Состояние для хранения идентификаторов товаров, выбранных для сравнения
  const [selectedIds, setSelectedIds] = useState([]);
  // Получаем функцию для навигации
  const navigate = useNavigate();

  // Эффект, который выполняется один раз при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для загрузки товаров
    const fetchProducts = async () => {
      try {
        // Отправляем GET-запрос к API и ждём ответ
        const response = await getProducts();
        // Сохраняем полученные данные в состояние products
        setProducts(response.data);
      } catch (error) {
        // Если произошла ошибка, выводим её в консоль
        console.error('Ошибка загрузки товаров:', error);
      }
    };
    // Вызываем функцию загрузки
    fetchProducts();
  }, []); // Пустой массив зависимостей гарантирует выполнение только при первой загрузке

  // Функция, которая вызывается при клике на чекбокс в карточке товара
  const handleSelect = (id, isChecked) => {
    if (isChecked) {
      // Если чекбокс установлен (товар выбран)
      if (selectedIds.length < 3) {
        // Если выбрано меньше 3 товаров, добавляем новый id в массив
        setSelectedIds([...selectedIds, id]);
      } else {
        // Если уже выбрано 3 товара, показываем предупреждение
        alert('Можно выбрать не более 3 товаров для сравнения');
      }
    } else {
      // Если чекбокс снят (товар убран из выбора)
      // Фильтруем массив, удаляя id этого товара
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Функция для перехода на страницу сравнения
  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      // Если выбрано 2 или 3 товара, переходим на страницу сравнения
      // Передаём массив выбранных id через state (доступен в location.state)
      navigate('/compare', { state: { selectedIds } });
    } else {
      // Если выбрано меньше 2, показываем предупреждение
      alert('Выберите минимум 2 товара для сравнения');
    }
  };

  // Функция для сброса всех выбранных товаров
  const handleClear = () => {
    setSelectedIds([]);
  };

  return (
    <div>
      {/* Заголовок страницы */}
      <h1>Каталог товаров</h1>
      
      {/* Блок с информацией о выбранных товарах и кнопками */}
      <div style={{ marginBottom: '20px' }}>
        {/* Отображаем количество выбранных товаров */}
        <span>Выбрано: {selectedIds.length} товаров</span>
        
        {/* Кнопка "Сравнить" активна только когда выбрано минимум 2 товара */}
        <button 
          onClick={handleCompare} 
          disabled={selectedIds.length < 2}
          style={{ marginLeft: '10px' }}
        >
          Сравнить ({selectedIds.length})
        </button>
        
        {/* Кнопка очистки выбора, показывается только если есть выбранные товары */}
        {selectedIds.length > 0 && (
          <button 
            onClick={handleClear}
            style={{ marginLeft: '10px' }}
          >
            Очистить выбор
          </button>
        )}
      </div>

      {/* Контейнер для карточек товаров (flex-сетка) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {/* Проходим по массиву products и для каждого товара создаём карточку */}
        {products.map(product => (
          <ProductCard
            key={product.id}                // Уникальный ключ для React
            product={product}                 // Передаём объект товара в пропс product
            onSelect={handleSelect}            // Передаём функцию обработки выбора
            isSelected={selectedIds.includes(product.id)} // Проверяем, выбран ли этот товар
          />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;