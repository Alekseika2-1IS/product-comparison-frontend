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

  const allowedSpecs = [
    'Операционная система',
    'Процессор',
    'Экран',
    'Память (ОЗУ/ПЗУ)',
    'Камера',
    'Аккумулятор',
    'Связь и подключение'
  ];

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

  useEffect(() => {
    if (products.length > 0 && selectedIds.length > 0) {
      const filtered = products.filter(product => selectedIds.includes(product.id));
      setSelectedProducts(filtered);
    } else {
      setSelectedProducts([]);
    }
  }, [products, selectedIds]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      navigate('/');
    }
  }, [selectedIds, navigate]);

  // --------------------------------------------------------------
  // 1. Оценка процессора
  // --------------------------------------------------------------
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

  // --------------------------------------------------------------
  // 2. Оценка экрана (балл от 0 до 100)
  // --------------------------------------------------------------
  const getScreenScore = (screenStr) => {
    if (!screenStr || screenStr === '—') return 0;
    const str = screenStr.toLowerCase();
    let score = 0;

    // Диагональ (чем больше, тем лучше для мультимедиа, но не перегружаем)
    const inchMatch = str.match(/(\d+\.?\d*)\s*["']/);
    if (inchMatch) {
      const inch = parseFloat(inchMatch[1]);
      if (inch >= 6.7) score += 20;
      else if (inch >= 6.3) score += 15;
      else if (inch >= 5.8) score += 10;
      else score += 5;
    }

    // Разрешение -> PPI
    let ppi = 0;
    const resMatch = str.match(/(\d+)x(\d+)/);
    if (resMatch && inchMatch) {
      const width = parseInt(resMatch[1], 10);
      const height = parseInt(resMatch[2], 10);
      const diag = parseFloat(inchMatch[1]);
      if (diag > 0) {
        const ppiVal = Math.sqrt(width * width + height * height) / diag;
        if (ppiVal >= 450) score += 30;
        else if (ppiVal >= 400) score += 25;
        else if (ppiVal >= 350) score += 20;
        else score += 10;
      }
    } else {
      // Если нет точного разрешения, даём средний балл
      score += 15;
    }

    // Тип матрицы
    if (str.includes('super retina xdr')) score += 25;
    else if (str.includes('dynamic amoled 2x')) score += 22;
    else if (str.includes('amoled') || str.includes('oled')) score += 20;
    else if (str.includes('ips')) score += 12;
    else score += 5;

    // Частота обновления
    const hzMatch = str.match(/(\d+)\s*гц/);
    if (hzMatch) {
      const hz = parseInt(hzMatch[1], 10);
      if (hz >= 120) score += 20;
      else if (hz >= 90) score += 15;
      else if (hz >= 60) score += 10;
      else score += 5;
    }

    // HDR
    if (str.includes('hdr')) score += 10;
    if (str.includes('dolby vision')) score += 5;

    // Яркость (если есть)
    const brightMatch = str.match(/(\d+)\s*нит/);
    if (brightMatch) {
      const nits = parseInt(brightMatch[1], 10);
      if (nits >= 1500) score += 15;
      else if (nits >= 1000) score += 10;
      else if (nits >= 600) score += 5;
    }

    return Math.min(score, 100);
  };

  // --------------------------------------------------------------
  // 3. Оценка памяти (ОЗУ*1000 + ПЗУ)
  // --------------------------------------------------------------
  const getMemoryScore = (memStr) => {
    if (!memStr || memStr === '—') return 0;
    const str = memStr.toLowerCase();
    let ram = 0, rom = 0;
    const ramMatch = str.match(/(\d+)\s*гб/i);
    if (ramMatch) ram = parseInt(ramMatch[1], 10);
    const romMatch = str.match(/(\d+)\s*гб\s*\/\s*(\d+)\s*гб/i);
    if (romMatch) {
      ram = parseInt(romMatch[1], 10);
      rom = parseInt(romMatch[2], 10);
    } else {
      const secondNum = str.match(/\/(\d+)\s*гб/i);
      if (secondNum) rom = parseInt(secondNum[1], 10);
      else rom = 0;
    }
    return ram * 1000 + rom;
  };

  // --------------------------------------------------------------
  // 4. Оценка камеры (сумма Мп)
  // --------------------------------------------------------------
  const getCameraScore = (camStr) => {
    if (!camStr || camStr === '—') return 0;
    const numbers = camStr.match(/\d+/g);
    if (numbers) {
      return numbers.reduce((sum, num) => sum + parseInt(num, 10), 0);
    }
    return 0;
  };

  // --------------------------------------------------------------
  // 5. Оценка аккумулятора (ёмкость в мАч)
  // --------------------------------------------------------------
  const getBatteryScore = (batStr) => {
    if (!batStr || batStr === '—') return 0;
    const match = batStr.match(/(\d+)\s*ма/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // --------------------------------------------------------------
  // 6. Оценка связи (балл за технологии)
  // --------------------------------------------------------------
  const getConnectivityScore = (connStr) => {
    if (!connStr || connStr === '—') return 0;
    const str = connStr.toLowerCase();
    let score = 0;
    if (str.includes('5g')) score += 20;
    if (str.includes('esim')) score += 10;
    if (str.includes('wi-fi 7') || str.includes('wi-fi 6e')) score += 15;
    else if (str.includes('wi-fi 6')) score += 12;
    else if (str.includes('wi-fi 5')) score += 8;
    if (str.includes('bluetooth 5.3') || str.includes('bluetooth 5.4')) score += 8;
    else if (str.includes('bluetooth 5.2') || str.includes('bluetooth 5.1')) score += 5;
    else if (str.includes('bluetooth 5')) score += 3;
    if (str.includes('nfc')) score += 5;
    return score;
  };

  // --------------------------------------------------------------
  // 7. Универсальная функция для извлечения числового значения (для числовых характеристик)
  // --------------------------------------------------------------
  const extractNumeric = (value, specName) => {
    if (!value || value === '—') return NaN;
    const lowerName = specName.toLowerCase();
    if (lowerName.includes('экран')) {
      // не используем числовое извлечение, там сложный балл
      return NaN;
    }
    if (lowerName.includes('память')) return getMemoryScore(value);
    if (lowerName.includes('камер')) return getCameraScore(value);
    if (lowerName.includes('аккумулятор')) return getBatteryScore(value);
    if (lowerName.includes('связь')) return getConnectivityScore(value);
    // универсальное число
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? NaN : num;
  };

  // --------------------------------------------------------------
  // 8. Определение лучшего/худшего/среднего для массива значений
  // --------------------------------------------------------------
  const getComparisonStatus = (specName, values, currentValue, idx) => {
    const lowerName = specName.toLowerCase();

    // Особое правило для ОС
    if (lowerName === 'операционная система') {
      const unique = [...new Set(values)];
      if (unique.length === 1) return null;
      if (currentValue === 'iOS') return 'best';
      return 'different';
    }

    // Для процессора используем рейтинг
    if (lowerName.includes('процессор')) {
      const scores = values.map(v => getCpuScore(v));
      if (scores.some(isNaN)) return null;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const currentScore = getCpuScore(currentValue);
      if (currentScore === maxScore && maxScore !== minScore) return 'best';
      if (currentScore === minScore && maxScore !== minScore) return 'worst';
      return 'different';
    }

    // Для экрана – специальная оценка
    if (lowerName.includes('экран')) {
      const scores = values.map(v => getScreenScore(v));
      if (scores.some(isNaN)) return null;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const currentScore = getScreenScore(currentValue);
      if (currentScore === maxScore && maxScore !== minScore) return 'best';
      if (currentScore === minScore && maxScore !== minScore) return 'worst';
      return 'different';
    }

    // Для памяти, камеры, аккумулятора, связи – числовые баллы
    if (lowerName.includes('память') || lowerName.includes('камер') || lowerName.includes('аккумулятор') || lowerName.includes('связь')) {
      let scores;
      if (lowerName.includes('память')) scores = values.map(v => getMemoryScore(v));
      else if (lowerName.includes('камер')) scores = values.map(v => getCameraScore(v));
      else if (lowerName.includes('аккумулятор')) scores = values.map(v => getBatteryScore(v));
      else scores = values.map(v => getConnectivityScore(v));

      if (scores.some(isNaN)) return null;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const currentScore = scores[idx];
      if (currentScore === maxScore && maxScore !== minScore) return 'best';
      if (currentScore === minScore && maxScore !== minScore) return 'worst';
      return 'different';
    }

    // Для остальных (нечисловых) – просто отличие
    if (values.some(v => v !== values[0])) {
      return 'different';
    }
    return null;
  };

  // --------------------------------------------------------------
  // 9. Построение таблицы
  // --------------------------------------------------------------
  const renderComparisonTable = () => {
    if (loading) return <div>Загрузка...</div>;
    if (selectedProducts.length === 0) return <div>Выбранные товары не найдены.</div>;

    const allSpecKeys = selectedProducts.flatMap(product =>
      Object.keys(product.specifications || {})
    );
    const uniqueSpecs = [...new Set(allSpecKeys)];

    const filteredSpecs = uniqueSpecs.filter(specName => {
      if (!allowedSpecs.includes(specName)) return false;
      const values = selectedProducts.map(p => p.specifications?.[specName] || '—');
      const allEqual = values.every(v => v === values[0]);
      return !allEqual;
    });

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
                      const status = getComparisonStatus(specName, values, value, idx);
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