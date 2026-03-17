// Импортируем необходимые хуки из React
import { useEffect, useState } from 'react';
// Хуки для навигации и получения данных, переданных через state
import { useNavigate, useLocation } from 'react-router-dom';
// Импортируем функцию для получения всех товаров из API
import { getProducts } from '../services/api';

// Компонент страницы сравнения товаров
const ComparePage = () => {
  // Хук для навигации (возврат в каталог)
  const navigate = useNavigate();
  // Хук для получения объекта location, из которого достаём state
  const location = useLocation();

  // Извлекаем массив selectedIds из location.state
  // Если state нет или selectedIds отсутствует, используем пустой массив
  const { selectedIds = [] } = location.state || {};

  // Состояние для хранения списка всех товаров, полученных с сервера
  const [products, setProducts] = useState([]);
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для хранения выбранных товаров (полные объекты)
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Эффект для загрузки всех товаров при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для загрузки
    const fetchProducts = async () => {
      try {
        // Вызываем API для получения всех товаров
        const response = await getProducts();
        // Сохраняем все товары в состояние
        setProducts(response.data);
      } catch (error) {
        // В случае ошибки выводим её в консоль
        console.error('Ошибка загрузки товаров:', error);
      } finally {
        // В любом случае снимаем флаг загрузки
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); // Пустой массив зависимостей – эффект выполнится только один раз

  // Эффект, который срабатывает, когда загружены товары или изменился selectedIds
  useEffect(() => {
    if (products.length > 0 && selectedIds.length > 0) {
      // Фильтруем массив products, оставляя только те, чей id есть в selectedIds
      const filtered = products.filter(product => selectedIds.includes(product.id));
      setSelectedProducts(filtered);
    } else {
      // Если нет выбранных товаров, оставляем пустой массив
      setSelectedProducts([]);
    }
  }, [products, selectedIds]); // Зависимости: когда products или selectedIds изменятся

  // Если массив selectedIds пуст (например, пользователь зашёл напрямую), перенаправляем в каталог
  useEffect(() => {
    if (selectedIds.length === 0) {
      navigate('/');
    }
  }, [selectedIds, navigate]); // Зависимости: selectedIds, navigate

  // Функция для построения таблицы сравнения
  const renderComparisonTable = () => {
    // Если товары ещё загружаются, показываем индикатор
    if (loading) return <div>Загрузка...</div>;
    // Если после фильтрации нет выбранных товаров (например, удалены), сообщаем
    if (selectedProducts.length === 0) return <div>Выбранные товары не найдены.</div>;

    // Собираем все уникальные названия характеристик из всех выбранных товаров
    // 1. flatMap для каждого товара берёт ключи из объекта specifications и объединяет в массив
    const allSpecKeys = selectedProducts.flatMap(product => 
      Object.keys(product.specifications || {})
    );
    // 2. Создаём Set для удаления дубликатов, затем преобразуем обратно в массив
    const uniqueSpecs = [...new Set(allSpecKeys)];

    return (
      <div>
        {/* Заголовок страницы */}
        <h2>Сравнение товаров</h2>
        
        {/* Кнопка возврата в каталог */}
        <button onClick={() => navigate('/')}>← Назад в каталог</button>

        {/* Контейнер для таблицы с возможностью горизонтальной прокрутки, если колонок много */}
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            {/* Заголовок таблицы */}
            <thead>
              <tr>
                {/* Левая верхняя ячейка – "Характеристика" */}
                <th style={cellStyle}>Характеристика</th>
                {/* Для каждого выбранного товара создаём колонку с его названием */}
                {selectedProducts.map(product => (
                  <th key={product.id} style={cellStyle}>
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Тело таблицы */}
            <tbody>
              {/* Для каждой уникальной характеристики создаём строку */}
              {uniqueSpecs.map(specName => (
                <tr key={specName}>
                  {/* Ячейка с названием характеристики (полужирный шрифт) */}
                  <td style={{ ...cellStyle, fontWeight: 'bold' }}>{specName}</td>
                  {/* Для каждого товара выводим значение данной характеристики */}
                  {selectedProducts.map(product => {
                    // Получаем значение характеристики, если нет – ставим прочерк
                    const value = product.specifications?.[specName] || '—';
                    return (
                      <td key={product.id} style={cellStyle}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Возвращаем результат функции renderComparisonTable
  return renderComparisonTable();
};

// Общий стиль для ячеек таблицы (для наглядности)
const cellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
};

export default ComparePage;