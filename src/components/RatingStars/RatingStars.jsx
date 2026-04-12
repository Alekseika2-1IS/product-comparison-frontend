import { useState, useEffect } from 'react';
import { getRating, setRating, getUserRating } from '../../services/ratingService';
import { getCurrentUser } from '../../services/authService';

const RatingStars = ({ productId, onRatingUpdate }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadRatings();
  }, [productId]);

  const loadRatings = async () => {
    const avg = await getRating(productId);
    setAverageRating(avg);
    if (currentUser) {
      const userRate = await getUserRating(productId, currentUser.id);
      setUserRating(userRate);
    }
  };

  const handleRating = async (value) => {
    if (!currentUser) {
      alert('Войдите, чтобы оценить товар');
      return;
    }
    await setRating(productId, currentUser.id, value);
    await loadRatings();
    if (onRatingUpdate) onRatingUpdate();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => handleRating(star)}
            style={{
              cursor: 'pointer',
              fontSize: '20px',
              color: (userRating && star <= userRating) || (!userRating && star <= averageRating) ? '#ffc107' : '#e4e5e9',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: '14px', color: '#666' }}>({averageRating.toFixed(1)})</span>
    </div>
  );
};

export default RatingStars;