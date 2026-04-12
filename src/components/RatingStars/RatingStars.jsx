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
    // Для средней оценки – заливаем целые звёзды и половинку
    const rating = averageRating;
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    if (starIndex <= fullStars) return '#ffc107';
    if (starIndex === fullStars + 1 && decimal >= 0.25) {
      // Половина звезды (можно сделать градиентом, но для простоты используем специальный символ)
      return 'half';
    }
    return '#e4e5e9';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {[1, 2, 3, 4, 5].map(star => {
          const fill = getStarFill(star);
          if (fill === 'half') {
            return (
              <span
                key={star}
                onClick={() => !readonly && handleRating(star)}
                style={{
                  cursor: readonly ? 'default' : 'pointer',
                  fontSize: '20px',
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <span style={{ position: 'absolute', overflow: 'hidden', width: '50%', color: '#ffc107' }}>★</span>
                <span style={{ color: '#e4e5e9' }}>★</span>
              </span>
            );
          }
          return (
            <span
              key={star}
              onClick={() => !readonly && handleRating(star)}
              style={{
                cursor: readonly ? 'default' : 'pointer',
                fontSize: '20px',
                color: fill,
                transition: 'color 0.2s'
              }}
            >
              ★
            </span>
          );
        })}
      </div>
      {!readonly && <span style={{ fontSize: '14px', color: '#666' }}>({averageRating.toFixed(1)})</span>}
    </div>
  );
};

export default RatingStars;