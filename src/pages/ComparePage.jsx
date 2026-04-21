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

  // Список разрешённых характеристик (только основные)
  const allowedSpecs = [
    'Операционная система',
    'Процессор',
    'Экран',
    'Память (ОЗУ/ПЗУ)',
    'Камера',
    'Аккумулятор',
    'Связь и подключение'
  ];

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

  // ----------------------------------------------------------------------
  // 1. Рейтинг процессоров (чем выше число, тем лучше)
  // ----------------------------------------------------------------------
  const getCpuScore = (cpuString) => {
    if (!cpuString) return 0;
    const str = cpuString.toLowerCase();
    if (str.includes('apple a19 pro')) return 100;
    if (str.includes('apple a19')) return 95;
    if (str.includes('apple a18')) return 90;
    if (str.includes('apple a17')) return 85;
    if (str.includes('apple a16')) return 80;
    if (str.includes('snapdragon 8 elite')) return 98;
    if (str.includes('snapdragon 8 gen 3')) return 92;
    if (str.includes('snapdragon 8 gen 2')) return 88;
    if (str.includes('snapdragon 8s gen 3')) return 86;
    if (str.includes('snapdragon 7')) return 70;
    if (str.includes('mediatek dimensity 9300')) return 94;
    if (str.includes('mediatek dimensity 9200')) return 87;
    if (str.includes('mediatek helio g99')) return 65;
    if (str.includes('mediatek helio')) return 55;
    if (str.includes('exynos 2400')) return 82;
    if (str.includes('exynos 1580')) return 68;
    if (str.includes('exynos 2200')) return 75;
    return 40;
  };

  // ----------------------------------------------------------------------
  // 2. Извлечение числового значения с учётом единиц и суммирования для камер
  // ----------------------------------------------------------------------
  const extractNumeric = (value, specName) => {
    if (!value || value === '—') return NaN;
    const str = value.toString().toLowerCase();
    const lowerName = specName.toLowerCase();

    // Для камер: суммируем все числа, разделённые '+'
    if (lowerName.includes('камер')) {
      const numbers = str.match(/\d+/g);
      if (numbers) {
        return numbers.reduce((sum, num) => sum + parseInt(num, 10), 0);
      }
      return NaN;
    }

    // Для ёмкости аккумулятора (мАч)
    if (lowerName.includes('аккумулятор') || str.includes('мач')) {
      const match = str.match(/(\d+)\s*ма/i);
      return match ? parseInt(match[1], 10) : NaN;
    }

    // Для частоты обновления (Гц)
    if (lowerName.includes('экран') || str.includes('гц')) {
      const match = str.match(/(\d+)\s*гц/i);
      return match ? parseInt(match[1], 10) : NaN;
    }

    // Для памяти (ГБ)
    if (lowerName.includes('память') || str.includes('гб')) {
      const match = str.match(/(\d+)\s*гб/i);
      return match ? parseInt(match[1], 10) : NaN;
    }

    // Для диагонали (дюймы)
    if (lowerName.includes('экран') && str.includes('"')) {
      const match = str.match(/(\d+\.?\d*)\s*"/);
      if (match) return parseFloat(match[1]);
      const match2 = str.match(/(\d+\.?\d*)\s*дюйм/i);
      return match2 ? parseFloat(match2[1]) : NaN;
    }

    // Для цены (если передадим отдельно)
    if (lowerName.includes('цена')) {
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : NaN;
    }

    // Универсальное: первое число в строке
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    return numMatch ? parseFloat(numMatch[1]) : NaN;
  };

  // ----------------------------------------------------------------------
  // 3. Определение типа характеристики (числовая/качественная)
  // ----------------------------------------------------------------------
  const isNumericSpec = (specName) => {
    const numericKeywords = [
      'процессор', 'экран', 'память', 'камера', 'аккумулятор',
      'цена', 'гб', 'мп', 'мач', 'гц', 'дюйм'
    ];
    const lowerName = specName.toLowerCase();
    return numericKeywords.some(kw => lowerName.includes(kw));
  };

  // ----------------------------------------------------------------------
  // 4. Основная логика сравнения для ячейки
  // ----------------------------------------------------------------------
  const getCellStyle = (specName, values, currentValue, productIndex) => {
    const lowerName = specName.toLowerCase();

    // --- Особое правило для операционной системы ---
    if (lowerName === 'операционная система') {
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length === 1) return null; // одинаковые – не выделяем
      if (currentValue === 'iOS') return 'best';
      return 'different'; // Android и другие – жёлтый
    }

    // --- Для процессора используем рейтинг ---
    if (lowerName.includes('процессор')) {
      const scores = values.map(v => getCpuScore(v));
      if (scores.some(isNaN)) return null;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      const currentScore = getCpuScore(currentValue);
      if (currentScore === bestScore && bestScore !== worstScore) return 'best';
      if (currentScore === worstScore && bestScore !== worstScore) return 'worst';
      return 'different';
    }

    // --- Для числовых характеристик ---
    if (isNumericSpec(specName)) {
      const numericValues = values.map(v => extractNumeric(v, specName));
      if (numericValues.some(isNaN)) return null;
      const isPrice = lowerName.includes('цен') || lowerName === 'цена';
      if (isPrice) {
        const minVal = Math.min(...numericValues);
        const maxVal = Math.max(...numericValues);
        if (minVal === maxVal) return null;
        if (numericValues[productIndex] === minVal) return 'best';
        if (numericValues[productIndex] === maxVal) return 'worst';
      } else {
        const maxVal = Math.max(...numericValues);
        const minVal = Math.min(...numericValues);
        if (minVal === maxVal) return null;
        if (numericValues[productIndex] === maxVal) return 'best';
        if (numericValues[productIndex] === minVal) return 'worst';
      }
      return 'different';
    }

    // --- Для нечисловых характеристик (например, "Связь и подключение") ---
    if (values.some(v => v !== values[0])) {
      return 'different';
    }
    return null;
  };

  // ----------------------------------------------------------------------
  // 5. Построение таблицы
  // ----------------------------------------------------------------------
  const renderComparisonTable = () => {
    if (loading) return <div>Загрузка...</div>;
    if (selectedProducts.length === 0) return <div>Выбранные товары не найдены.</div>;

    // Собираем все характеристики из выбранных товаров
    const allSpecKeys = selectedProducts.flatMap(product =>
      Object.keys(product.specifications || {})
    );
    const uniqueSpecs = [...new Set(allSpecKeys)];

    // Фильтруем: оставляем только разрешённые и те, у которых не все значения одинаковы
    const filteredSpecs = uniqueSpecs.filter(specName => {
      if (!allowedSpecs.includes(specName)) return false;
      const values = selectedProducts.map(p => p.specifications?.[specName] || '—');
      const allEqual = values.every(v => v === values[0]);
      return !allEqual;
    });

    // Сортируем характеристики для удобства (можно по желанию)
    const order = allowedSpecs;
    filteredSpecs.sort((a, b) => order.indexOf(a) - order.indexOf(b));

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
                  <th key={product.id} style={cellStyle}>{product.name}</th>
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
                      const status = getCellStyle(specName, values, value, idx);
                      if (status === 'best') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#d4edda', color: '#155724' };
                      } else if (status === 'worst') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#f8d7da', color: '#721c24' };
                      } else if (status === 'different') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#fff3cd' };
                      }
                      return (
                        <td key={product.id} style={cellStyleExtended}>
                          {value}
                        </table>
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