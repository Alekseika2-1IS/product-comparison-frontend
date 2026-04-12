import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { getProductRating, addReview, getReviews, deleteReview } from '../services/ratingsService';
import { isAdmin } from '../services/authService';
import RatingStars from '../components/RatingStars/RatingStars';

const ProductPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewError, setReviewError] = useState('');

  const loadData = () => {
    const info = getProductRating(id);
    setRatingInfo(info);
    const reviewsList = getReviews(id);
    setReviews(reviewsList);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRes = await getProductById(id);
        setProduct(productRes.data);
        loadData();
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleRate = (stars) => {
    if (!user) {
      alert('Войдите, чтобы оценить товар');
      return;
    }
    setSelectedStars(stars);
  };

  const handleSubmitReview = () => {
    if (!user) {
      alert('Войдите, чтобы оставить отзыв');
      return;
    }
    if (selectedStars === 0) {
      setReviewError('Выберите количество звезд');
      return;
    }
    setReviewError('');
    addReview(id, user.id, user.login, newReview, selectedStars);
    loadData(); // обновляем рейтинг и отзывы на странице
    setNewReview('');
    setSelectedStars(0);
    // Отправляем событие для обновления карточек в каталоге
    window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { productId: id } }));
    alert('Спасибо за ваш отзыв!');
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Удалить этот отзыв?')) {
      deleteReview(reviewId);
      loadData();
      window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { productId: id } }));
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Назад</button>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          style={{ width: '300px', objectFit: 'contain' }}
          onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
        />
        <div>
          <h1>{product.name}</h1>
          <p>Цена: {product.price} руб.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RatingStars rating={ratingInfo.average} onRate={handleRate} readonly={false} />
            <span>({ratingInfo.count} оценок)</span>
          </div>
          <p><strong>Описание:</strong> {product.description}</p>
          <h3>Характеристики</h3>
          <ul>
            {Object.entries(product.specifications || {}).map(([key, val]) => (
              <li key={key}><strong>{key}:</strong> {val}</li>
            ))}
          </ul>
        </div>
      </div>

      {user && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h3>Оставить отзыв</h3>
          {reviewError && <div style={{ color: 'red', marginBottom: '10px' }}>{reviewError}</div>}
          <div style={{ marginBottom: '10px' }}>
            <RatingStars rating={selectedStars} onRate={handleRate} readonly={false} />
          </div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Ваш отзыв..."
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
          <button onClick={handleSubmitReview} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Отправить отзыв
          </button>
        </div>
      )}

      {reviews.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Отзывы</h3>
          {reviews.map((rev) => (
            <div key={rev.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', position: 'relative' }}>
              <strong>{rev.author}</strong> <span style={{ color: '#888' }}>{rev.date}</span>
              <p>{rev.text}</p>
              {isAdmin() && (
                <button onClick={() => handleDeleteReview(rev.id)} style={{ position: 'absolute', right: 0, top: 10, background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;