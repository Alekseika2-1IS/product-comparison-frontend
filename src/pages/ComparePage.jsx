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

  // ----------------------------------------------------------------------
  // 1. Рейтинг процессоров (чем выше число, тем лучше)
  // ----------------------------------------------------------------------
  const getCpuScore = (cpuString) => {
    if (!cpuString) return 0;
    const str = cpuString.toLowerCase();
    // Apple
    if (str.includes('apple a19 pro')) return 100;
    if (str.includes('apple a18')) return 95;
    if (str.includes('apple a17')) return 90;
    if (str.includes('apple a16')) return 85;
    // Qualcomm Snapdragon
    if (str.includes('snapdragon 8 elite')) return 98;
    if (str.includes('snapdragon 8 gen 3')) return 92;
    if (str.includes('snapdragon 8 gen 2')) return 88;
    if (str.includes('snapdragon 8s gen 3')) return 86;
    if (str.includes('snapdragon 7')) return 70;
    // MediaTek
    if (str.includes('mediatek dimensity 9300')) return 94;
    if (str.includes('mediatek dimensity 9200')) return 87;
    if (str.includes('mediatek helio g200')) return 65;
    if (str.includes('mediatek helio')) return 55;
    // Samsung Exynos
    if (str.includes('exynos 2400')) return 82;
    if (str.includes('exynos 2200')) return 75;
    // Google Tensor
    if (str.includes('tensor g4')) return 80;
    // Другие
    return 40;
  };

  // ----------------------------------------------------------------------
  // 2. Извлечение числового значения из строки (для памяти, частоты, ёмкости и т.д.)
  // ----------------------------------------------------------------------
  const extractNumeric = (value, specName) => {
    if (value === '—') return NaN;
    const str = value.toString().toLowerCase();

    // Для частоты обновления (Гц)
    if (specName.toLowerCase().includes('гц') || str.includes('гц')) {
      const match = str.match(/(\d+)\s*гц/i);
      return match ? parseInt(match[1], 10) : NaN;
    }
    // Для мегапикселей (Мп)
    if (specName.toLowerCase().includes('камер') || str.includes('мп')) {
      const match = str.match(/(\d+)\s*мп/i);
      return match ? parseInt(match[1], 10) : NaN;
    }
    // Для памяти (ГБ)
    if (specName.toLowerCase().includes('память') || str.includes('гб')) {
      const match = str.match(/(\d+)\s*гб/i);
      return match ? parseInt(match[1], 10) : NaN;
    }
    // Для ёмкости аккумулятора (мАч)
    if (specName.toLowerCase().includes('питание') || str.includes('мач') || str.includes('ма*ч')) {
      const match = str.match(/(\d+)\s*ма/i);
      return match ? parseInt(match[1], 10) : NaN;
    }
    // Для диагонали (дюймы)
    if (specName.toLowerCase().includes('дисплей') || str.includes('дюйм')) {
      const match = str.match(/(\d+\.?\d*)\s*["']/i);
      if (match) return parseFloat(match[1]);
      const match2 = str.match(/(\d+\.?\d*)\s*дюйм/i);
      return match2 ? parseFloat(match2[1]) : NaN;
    }
    // Универсальное: если есть число, берём первое число
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    return numMatch ? parseFloat(numMatch[1]) : NaN;
  };

  // ----------------------------------------------------------------------
  // 3. Определение типа характеристики (числовая/качественная) и правил сравнения
  // ----------------------------------------------------------------------
  const isNumericSpec = (specName, value) => {
    const numericKeywords = [
      'цена', 'память', 'гб', 'мгц', 'ггц', 'мач', 'дюйм', 'гц', 'мп',
      'объем', 'частота', 'тактовая частота', 'разрешение', 'пикселей', 'мегапиксель'
    ];
    const lowerName = specName.toLowerCase();
    const hasKeyword = numericKeywords.some(keyword => lowerName.includes(keyword));
    const extracted = extractNumeric(value, specName);
    return hasKeyword || !isNaN(extracted);
  };

  const getComparisonStatus = (specName, values, currentValue, productIndex, productsArray) => {
    const lowerName = specName.toLowerCase();

    // Специальная обработка для процессоров
    if (lowerName.includes('процессор')) {
      const scores = values.map(v => getCpuScore(v));
      if (scores.some(isNaN)) return null;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      const currentScore = getCpuScore(currentValue);
      if (currentScore === bestScore && bestScore !== worstScore) return 'best';
      if (currentScore === worstScore && bestScore !== worstScore) return 'worst';
      return null;
    }

    // Для числовых характеристик
    if (isNumericSpec(specName, currentValue)) {
      const numericValues = values.map(v => extractNumeric(v, specName));
      if (numericValues.some(isNaN)) return null;
      const isPrice = lowerName.includes('цен');
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
      return null;
    }
    return null; // для нечисловых не даём зелёный/красный (будет жёлтый, если отличаются)
  };

  // ----------------------------------------------------------------------
  // 4. Построение таблицы
  // ----------------------------------------------------------------------
  const renderComparisonTable = () => {
    if (loading) return <div>Загрузка...</div>;
    if (selectedProducts.length === 0) return <div>Выбранные товары не найдены.</div>;

    // Собираем все характеристики
    const allSpecKeys = selectedProducts.flatMap(product =>
      Object.keys(product.specifications || {})
    );
    const uniqueSpecs = [...new Set(allSpecKeys)];

    // Фильтруем: оставляем только те, у которых не все значения одинаковы
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
                      // Определяем статус сравнения (зелёный/красный)
                      const status = getComparisonStatus(specName, values, value, idx, selectedProducts);
                      if (status === 'best') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#d4edda', color: '#155724' };
                      } else if (status === 'worst') {
                        cellStyleExtended = { ...cellStyleExtended, backgroundColor: '#f8d7da', color: '#721c24' };
                      } else if (value !== values[0]) {
                        // Для нечисловых или не сравнимых – жёлтая подсветка отличий
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