const ProductCard = ({ product, onSelect, isSelected }) => {
  const handleCheckboxChange = (e) => {
    onSelect(product.id, e.target.checked);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', width: '200px' }}>
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
      />
      <h3>{product.name}</h3>
      <p>{product.price} руб.</p>
      <label>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleCheckboxChange} 
        />
        Сравнить
      </label>
    </div>
  );
};

export default ProductCard;