import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../services/api';

// Компонент формы добавления/редактирования товара
// Пропсы:
// - productToEdit: объект товара для редактирования (null для добавления)
// - onClose: функция закрытия формы
// - onProductSaved: функция, вызываемая после успешного сохранения (передаёт сохранённый товар)

const ProductForm = ({ productToEdit = null, onClose, onProductSaved }) => {
  // Состояние для основных полей формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  // Состояние для списка характеристик (массив объектов { name, value })
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);

  // Состояние для процесса загрузки (отправки)
  const [loading, setLoading] = useState(false);

  // Состояние для сообщений об ошибках
  const [error, setError] = useState('');

  // Если передан productToEdit (режим редактирования), заполняем форму при монтировании
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        category: productToEdit.category || '',
        imageUrl: productToEdit.imageUrl || ''
      });

      // Преобразуем объект specifications в массив пар
      if (productToEdit.specifications) {
        const specsArray = Object.entries(productToEdit.specifications).map(([name, value]) => ({
          name,
          value
        }));
        // Если массив не пуст, используем его, иначе оставляем одну пустую строку
        setSpecs(specsArray.length ? specsArray : [{ name: '', value: '' }]);
      } else {
        setSpecs([{ name: '', value: '' }]);
      }
    }
  }, [productToEdit]);

  // Обработчик изменения основных полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения полей характеристик
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index][field] = value;
    setSpecs(updatedSpecs);
  };

  // Добавить новую строку характеристики
  const addSpec = () => {
    setSpecs([...specs, { name: '', value: '' }]);
  };

  // Удалить строку характеристики (если строк больше 1)
  const removeSpec = (index) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  // Валидация формы
  const validate = () => {
    if (!formData.name.trim()) return 'Название обязательно';
    if (!formData.price) return 'Цена обязательна';
    if (isNaN(formData.price) || Number(formData.price) <= 0) return 'Цена должна быть положительным числом';
    if (!formData.category.trim()) return 'Категория обязательна';
    return null;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Преобразуем массив характеристик в объект (только заполненные)
    const specifications = {};
    specs.forEach(spec => {
      if (spec.name.trim() && spec.value.trim()) {
        specifications[spec.name.trim()] = spec.value.trim();
      }
    });

    // Формируем объект для отправки
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
        // Режим редактирования
        response = await updateProduct(productToEdit.id, productData);
      } else {
        // Режим добавления
        response = await createProduct(productData);
      }

      // Передаём сохранённый товар родителю (он может быть в response.data)
      onProductSaved(response.data);
      onClose(); // Закрываем форму
    } catch (err) {
      setError('Ошибка при сохранении товара. Проверьте подключение к серверу.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Стили для модального окна
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
    width: '500px',
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

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      {/* Останавливаем всплытие клика, чтобы клик по содержимому не закрывал форму */}
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>{productToEdit ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '10px', padding: '8px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Основные поля */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Название *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={fieldStyle}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...fieldStyle, minHeight: '60px' }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Цена *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={fieldStyle}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Категория *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={fieldStyle}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Ссылка на изображение</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              style={fieldStyle}
              disabled={loading}
            />
          </div>

          {/* Блок характеристик */}
          <h3>Характеристики</h3>
          {specs.map((spec, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Название (например, Процессор)"
                value={spec.name}
                onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Значение"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
              />
              {specs.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeSpec(index)} 
                  style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  disabled={loading}
                >
                  ✖
                </button>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={addSpec} 
            style={{ marginBottom: '20px', padding: '8px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            disabled={loading}
          >
            + Добавить характеристику
          </button>

          {/* Кнопки действий */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '8px 16px', background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : (productToEdit ? 'Сохранить изменения' : 'Создать товар')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;