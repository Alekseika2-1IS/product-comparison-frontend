const RatingStars = ({ rating, onRate, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map(star => (
        <span
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            fontSize: '20px',
            color: star <= rating ? '#ffc107' : '#e4e5e9'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;