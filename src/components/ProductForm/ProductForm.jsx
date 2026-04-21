import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../services/api';

const ProductForm = ({ productToEdit = null, onClose, onProductSaved }) => {
  // Основные поля товара
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  // Состояние для предопределённых характеристик
  const [specsFixed, setSpecsFixed] = useState({
    os: '',              // Операционная система
    cpu: '',             // Процессор
    display: '',         // Экран
    memory: '',          // Память (ОЗУ/ПЗУ)
    camera: '',          // Камера
    battery: '',         // Аккумулятор
    connectivity: '',    // Связь и подключение
    material: '',        // Материал корпуса
    features: ''         // Дополнительные функции
  });

  // Состояние для дополнительных характеристик (динамические)
  const [extraSpecs, setExtraSpecs] = useState([{ name: '', value: '' }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Если редактируем товар – заполняем форму из productToEdit
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        category: productToEdit.category || '',
        imageUrl: productToEdit.imageUrl || ''
      });

      // Заполняем предопределённые характеристики из productToEdit.specifications
      const specs = productToEdit.specifications || {};
      setSpecsFixed({
        os: specs['Операционная система'] || '',
        cpu: specs['Процессор'] || '',
        display: specs['Экран'] || '',
        memory: specs['Память (ОЗУ/ПЗУ)'] || '',
        camera: specs['Камера'] || '',
        battery: specs['Аккумулятор'] || '',
        connectivity: specs['Связь и подключение'] || '',
        material: specs['Материал корпуса'] || '',
        features: specs['Дополнительные функции'] || ''
      });

      // Заполняем дополнительные характеристики
      const otherSpecs = Object.entries(specs).filter(([key]) =>
        !['Операционная система', 'Процессор', 'Экран', 'Память (ОЗУ/ПЗУ)', 'Камера', 'Аккумулятор', 'Связь и подключение', 'Материал корпуса', 'Дополнительные функции'].includes(key)
      );
      if (otherSpecs.length > 0) {
        setExtraSpecs(otherSpecs.map(([name, value]) => ({ name, value })));
      } else {
        setExtraSpecs([{ name: '', value: '' }]);
      }
    }
  }, [productToEdit]);

  // Обработчики для основных полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчики для предопределённых характеристик
  const handleFixedSpecChange = (field, value) => {
    setSpecsFixed(prev => ({ ...prev, [field]: value }));
  };

  // Обработчики для дополнительных характеристик
  const handleExtraSpecChange = (index, field, value) => {
    const updated = [...extraSpecs];
    updated[index][field] = value;
    setExtraSpecs(updated);
  };

  const addExtraSpec = () => {
    setExtraSpecs([...extraSpecs, { name: '', value: '' }]);
  };

  const removeExtraSpec = (index) => {
    if (extraSpecs.length > 1) {
      setExtraSpecs(extraSpecs.filter((_, i) => i !== index));
    }
  };

  // Валидация основных полей
  const validate = () => {
    if (!formData.name.trim()) return 'Название обязательно';
    if (!formData.price) return 'Цена обязательна';
    if (isNaN(formData.price) || Number(formData.price) <= 0) return 'Цена должна быть положительным числом';
    if (!formData.category.trim()) return 'Категория обязательна';
    return null;
  };

  // Сборка объекта specifications из предопределённых и дополнительных
  const buildSpecifications = () => {
    const specs = {};
    if (specsFixed.os.trim()) specs['Операционная система'] = specsFixed.os.trim();
    if (specsFixed.cpu.trim()) specs['Процессор'] = specsFixed.cpu.trim();
    if (specsFixed.display.trim()) specs['Экран'] = specsFixed.display.trim();
    if (specsFixed.memory.trim()) specs['Память (ОЗУ/ПЗУ)'] = specsFixed.memory.trim();
    if (specsFixed.camera.trim()) specs['Камера'] = specsFixed.camera.trim();
    if (specsFixed.battery.trim()) specs['Аккумулятор'] = specsFixed.battery.trim();
    if (specsFixed.connectivity.trim()) specs['Связь и подключение'] = specsFixed.connectivity.trim();
    if (specsFixed.material.trim()) specs['Материал корпуса'] = specsFixed.material.trim();
    if (specsFixed.features.trim()) specs['Дополнительные функции'] = specsFixed.features.trim();

    // Добавляем дополнительные характеристики
    extraSpecs.forEach(spec => {
      if (spec.name.trim() && spec.value.trim()) {
        specs[spec.name.trim()] = spec.value.trim();
      }
    });
    return specs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const specifications = buildSpecifications();

    const productData = {
      ...formData,
      price: Number(formData.price),
      specifications
    };

    setLoading(true);
    setError('');

    try {
      let response;
      if (productToEdit) {
        response = await updateProduct(productToEdit.id, productData);
      } else {
        response = await createProduct(productData);
      }
      onProductSaved(response.data);
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении товара. Проверьте подключение к серверу.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Стили (можно оставить как есть или вынести в CSS)
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  };

  const fieldStyle = {
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const sectionTitle = {
    marginTop: '15px',
    marginBottom: '10px',
    fontSize: '1.1rem',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>{productToEdit ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Основные поля */}
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Название *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Описание</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...fieldStyle, minHeight: '60px' }} disabled={loading} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Цена *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Категория *</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Ссылка на изображение</label>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={fieldStyle} disabled={loading} />
          </div>

          {/* Предопределённые характеристики */}
          <h3 style={sectionTitle}>Основные характеристики</h3>

          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Операционная система</label>
            <input type="text" value={specsFixed.os} onChange={(e) => handleFixedSpecChange('os', e.target.value)} placeholder="Android, iOS..." style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Процессор</label>
            <input type="text" value={specsFixed.cpu} onChange={(e) => handleFixedSpecChange('cpu', e.target.value)} placeholder="Qualcomm Snapdragon 8 Gen 3, Apple A17 Pro..." style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Экран</label>
            <input type="text" value={specsFixed.display} onChange={(e) => handleFixedSpecChange('display', e.target.value)} placeholder="6.7\", AMOLED, 120 Гц, 2560x1440" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Память (ОЗУ/ПЗУ)</label>
            <input type="text" value={specsFixed.memory} onChange={(e) => handleFixedSpecChange('memory', e.target.value)} placeholder="12 ГБ / 256 ГБ" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Камера</label>
            <input type="text" value={specsFixed.camera} onChange={(e) => handleFixedSpecChange('camera', e.target.value)} placeholder="50+12+8 Мп" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Аккумулятор</label>
            <input type="text" value={specsFixed.battery} onChange={(e) => handleFixedSpecChange('battery', e.target.value)} placeholder="5000 мАч, 65 Вт" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Связь и подключение</label>
            <input type="text" value={specsFixed.connectivity} onChange={(e) => handleFixedSpecChange('connectivity', e.target.value)} placeholder="5G, Wi‑Fi 6, Bluetooth 5.3, NFC" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Материал корпуса</label>
            <input type="text" value={specsFixed.material} onChange={(e) => handleFixedSpecChange('material', e.target.value)} placeholder="Стекло + алюминий" style={fieldStyle} disabled={loading} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Дополнительные функции</label>
            <input type="text" value={specsFixed.features} onChange={(e) => handleFixedSpecChange('features', e.target.value)} placeholder="Сканер отпечатков, IP68, стереодинамики" style={fieldStyle} disabled={loading} />
          </div>

          {/* Дополнительные характеристики (динамические) */}
          <h3 style={sectionTitle}>Дополнительные характеристики</h3>
          {extraSpecs.map((spec, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Название (например, ИК-порт)"
                value={spec.name}
                onChange={(e) => handleExtraSpecChange(index, 'name', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Значение"
                value={spec.value}
                onChange={(e) => handleExtraSpecChange(index, 'value', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
              />
              {extraSpecs.length > 1 && (
                <button type="button" onClick={() => removeExtraSpec(index)} style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>✖</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addExtraSpec} style={{ marginBottom: '20px', padding: '8px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>
            + Добавить характеристику
          </button>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>Отмена</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>
              {loading ? 'Сохранение...' : (productToEdit ? 'Сохранить изменения' : 'Создать товар')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;