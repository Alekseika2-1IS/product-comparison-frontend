import React, { useState, useEffect } from 'react';
import RatingStars from '../RatingStars/RatingStars';
import { getProductRating } from '../../services/ratingsService';

const ProductCard = ({ product, onSelect, isSelected, onEdit, onDelete, user, onAddToCart }) => {
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);

  useEffect(() => {
    const info = getProductRating(product.id);
    setRatingInfo(info);
  }, [product.id]);

  const handleRate = (stars) => {
    if (!user) {
      alert('Для оценки товара необходимо войти');
      return;
    }
    setSelectedStars(stars);
    setShowReviewForm(true);
  };

  const submitReview = () => {
    if (selectedStars === 0) {
      alert('Выберите количество звезд');
      return;
    }
    // Здесь должен быть вызов сервиса добавления отзыва
    alert(`Спасибо за оценку ${selectedStars} звезд! Отзыв: ${reviewText || 'без комментария'}`);
    setShowReviewForm(false);
    setReviewText('');
    setSelectedStars(0);
    const newInfo = getProductRating(product.id);
    setRatingInfo(newInfo);
  };

  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(product);
  };

  const handleCheckboxChange = (e) => {
    onSelect(product.id, e.target.checked);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
  };

  const goToProductPage = () => {
    window.location.href = `/product/${product.id}`;
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px',
      width: '240px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      cursor: 'pointer'
    }} onClick={goToProductPage}>
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={product.name} 
        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
        onError={handleImageError}
      />
      <h3 style={{ fontSize: '1rem', margin: '10px 0 5px' }}>{product.name}</h3>
      <p style={{ fontWeight: 'bold' }}>{product.price} руб.</p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
        <RatingStars rating={ratingInfo.average} onRate={handleRate} readonly={false} />
        <span>({ratingInfo.count})</span>
      </div>

      <div style={{ margin: '10px 0' }} onClick={(e) => e.stopPropagation()}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input type="checkbox" checked={isSelected} onChange={handleCheckboxChange} />
          <span>Сравнить</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={handleAddToCart} style={{ flex: 1, backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}>
          В корзину
        </button>
        {user && user.role === 'admin' && (
          <>
            <button onClick={() => onEdit(product)} style={{ flex: 1, backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ред.</button>
            <button onClick={() => onDelete(product.id)} style={{ flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Удалить</button>
          </>
        )}
      </div>

      {showReviewForm && (
        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }} onClick={(e) => e.stopPropagation()}>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Ваш отзыв (необязательно)" rows="2" style={{ width: '100%' }} />
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <button onClick={submitReview}>Отправить</button>
            <button onClick={() => setShowReviewForm(false)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;