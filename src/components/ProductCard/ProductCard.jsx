const ProductCard = ({ product, onSelect, isSelected, onEdit, onDelete }) => {
  // Обработчик изменения чекбокса
  const handleCheckboxChange = (e) => {
    onSelect(product.id, e.target.checked);
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px',
      width: '220px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      position: 'relative',
      backgroundColor: '#fff'
    }}>
      {/* Изображение товара */}
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={product.name} 
        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
      />
      
      {/* Название товара */}
      <h3 style={{ margin: '10px 0 5px', fontSize: '1.1rem' }}>{product.name}</h3>
      
      {/* Цена товара */}
      <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{product.price} руб.</p>
      
      {/* Чекбокс для выбора сравнения */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '10px 0' }}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleCheckboxChange} 
        />
        <span>Сравнить</span>
      </label>

      {/* Кнопки управления (редактирование/удаление) */}
      <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
        <button 
          onClick={() => onEdit(product)} 
          style={{
            flex: 1,
            padding: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✎ Ред.
        </button>
        <button 
          onClick={() => onDelete(product.id)} 
          style={{
            flex: 1,
            padding: '5px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑 Удалить
        </button>
      </div>
    </div>
  );
};

export default ProductCard;