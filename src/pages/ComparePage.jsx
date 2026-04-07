import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../services/api';

const ComparePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds = [] } = location.state || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Загрузка всех товаров
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Фильтрация выбранных товаров
  useEffect(() => {
    if (products.length > 0 && selectedIds.length > 0) {
      const filtered = products.filter(product => selectedIds.includes(product.id));
      setSelectedProducts(filtered);
    } else {
      setSelectedProducts([]);
    }
  }, [products, selectedIds]);

  // Редирект, если нет выбранных товаров
  useEffect(() => {
    if (selectedIds.length === 0) {
      navigate('/');
    }
  }, [selectedIds, navigate]);

  // Функция для определения, является ли характеристика количественной (числовой)
  const isNumericSpec = (specName, value) => {
    // Проверяем по ключевым словам и наличию чисел
    const numericKeywords = ['цена', 'память', 'ГБ', 'МГц', 'ГГц', 'дюйм', 'дюйма', 'мАч', 'ватт', 'кг', 'г'];
    const lowerName = specName.toLowerCase();
    const hasKeyword = numericKeywords.some(keyword => lowerName.includes(keyword));
    // Также проверяем, что значение можно преобразовать в число (если оно содержит цифры)
    const numericValue = parseFloat(value);
    const isNumeric = !isNaN(numericValue) && value.toString().match(/\d/);
    return hasKeyword || isNumeric;
  };

  // Функция для определения, какое значение лучше (для числовых характеристик)
  // Возвращает 'best', 'worst', или null
  const getComparisonStatus = (specName, values, currentValue) => {
    if (!isNumericSpec(specName, currentValue)) return null;

    // Преобразуем все значения в числа (удаляем всё кроме цифр, точки и запятой)
    const numericValues = values.map(v => {
      if (v === '—') return NaN;
      const num = parseFloat(v.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
      return isNaN(num) ? NaN : num;
    });

    // Если хотя бы одно значение не число – не сравниваем
    if (numericValues.some(isNaN)) return null;

    const currentNum = parseFloat(currentValue.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(currentNum)) return null;

    // Правило: для цены лучше меньше, для остальных – больше
    const isPrice = specName.toLowerCase().includes('цен');
    if (isPrice) {
      const minVal = Math.min(...numericValues);
      if (currentNum === minVal) return 'best';
      if (currentNum === Math.max(...numericValues)) return 'worst';
    } else {
      const maxVal = Math.max(...numericValues);
      if (currentNum === maxVal) return 'best';
      if (currentNum === Math.min(...numericValues)) return 'worst';
    }
    return null;
  };

  // Построение таблицы сравнения с фильтрацией одинаковых строк и подсветкой
  const renderComparisonTable = () => {
    if (loading) return <div>Загрузка...</div>;
    if (selectedProducts.length === 0) return <div>Выбранные товары не найдены.</div>;

    // Собираем все уникальные названия характеристик
    const allSpecKeys = selectedProducts.flatMap(product =>
      Object.keys(product.specifications || {})
    );
    const uniqueSpecs = [...new Set(allSpecKeys)];

    // Фильтруем: оставляем только те характеристики, у которых не все значения одинаковы
    const filteredSpecs = uniqueSpecs.filter(specName => {
      const values = selectedProducts.map(p => p.specifications?.[specName] || '—');
      const allEqual = values.every(v => v === values[0]);
      return !allEqual;
    });

    return (
      <div>
        <h2>Сравнение товаров</h2>
        <button onClick={() => navigate('/')}>← Назад в каталог</button>

        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={cellStyle}>Характеристика</th>
                {selectedProducts.map(product => (
                  <th key={product.id} style={cellStyle}>
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.map(specName => {
                const values = selectedProducts.map(p => p.specifications?.[specName] || '—');
                return (
                  <tr key={specName}>
                    <td style={{ ...cellStyle, fontWeight: 'bold' }}>{specName}</td>
                    {selectedProducts.map((product, idx) => {
                      const value = values[idx];
                      let cellStyleExtended = { ...cellStyle };
                      // Определяем статус сравнения (только для числовых характеристик)
                      const status = getComparisonStatus(specName, values, value);
                      if (status === 'best') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#d4edda', color: '#155724' };
                      } else if (status === 'worst') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#f8d7da', color: '#721c24' };
                      } else if (value !== values[0] && status === null) {
                        // Для нечисловых характеристик – жёлтая подсветка отличий
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#fff3cd' };
                      }
                      return (
                        <td key={product.id} style={cellStyleExtended}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return renderComparisonTable();
};

const cellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
};

export default ComparePage;