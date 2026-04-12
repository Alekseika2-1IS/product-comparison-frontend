import { useState, useEffect } from 'react';
import { getRating, setRating, getUserRating } from '../../services/ratingsService';
import { getCurrentUser } from '../../services/authService';

const RatingStars = ({ productId, onRatingUpdate, rating: externalRating, onRate, readonly = false }) => {
  const [averageRating, setAverageRating] = useState(externalRating || 0);
  const [userRating, setUserRating] = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!externalRating && productId) {
      loadRatings();
    } else if (externalRating !== undefined) {
      setAverageRating(externalRating);
    }
  }, [productId, externalRating]);

  const loadRatings = async () => {
    const avg = await getRating(productId);
    setAverageRating(avg);
    if (currentUser) {
      const userRate = await getUserRating(productId, currentUser.id);
      setUserRating(userRate);
    }
  };

  const handleRating = async (value) => {
    if (readonly) return;
    if (!currentUser) {
      alert('Войдите, чтобы оценить товар');
      return;
    }
    if (onRate) {
      onRate(value);
    } else {
      await setRating(productId, currentUser.id, value);
      await loadRatings();
      if (onRatingUpdate) onRatingUpdate();
    }
  };

  // Определяем, какую звезду показывать (для средней оценки)
  const getStarFill = (starIndex) => {
    if (userRating !== null && !readonly) {
      return starIndex <= userRating ? '#ffc107' : '#e4e5e9';
    }
    // Для средней оценки – заливаем целые звёзды, для дробных – частично
    const fullStars = Math.floor(averageRating);
    const decimal = averageRating - fullStars;
    if (starIndex <= fullStars) return '#ffc107';
    if (starIndex === fullStars + 1 && decimal > 0) {
      // Частичная заливка (можно сделать градиентом, но для простоты оставим полную звезду)
      return '#ffc107';
    }
    return '#e4e5e9';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => !readonly && handleRating(star)}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              fontSize: '20px',
              color: getStarFill(star),
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      {!readonly && <span style={{ fontSize: '14px', color: '#666' }}>({averageRating.toFixed(1)})</span>}
    </div>
  );
};

export default RatingStars;