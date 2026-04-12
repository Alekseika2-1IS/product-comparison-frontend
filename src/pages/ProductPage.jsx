import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { getProductRating, addReview, getReviews } from '../services/ratingsService';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await getProductById(id);
        setProduct(productRes.data);
        const info = getProductRating(id);
        setRatingInfo(info);
        const reviewsList = getReviews(id);
        setReviews(reviewsList);
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRate = (stars) => {
    if (!user) {
      alert('Войдите, чтобы оценить товар');
      return;
    }
    setSelectedStars(stars);
  };

  const handleSubmitReview = () => {
    if (selectedStars === 0) {
      alert('Выберите количество звезд');
      return;
    }
    if (!user) {
      alert('Войдите, чтобы оставить отзыв');
      return;
    }
    // Добавляем отзыв через сервис
    addReview(id, user.id, user.login, newReview, selectedStars);
    // Обновляем рейтинг и отзывы
    const updatedInfo = getProductRating(id);
    setRatingInfo(updatedInfo);
    const updatedReviews = getReviews(id);
    setReviews(updatedReviews);
    setNewReview('');
    setSelectedStars(0);
    alert('Спасибо за отзыв!');
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
          {reviews.map((rev, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{rev.author}</strong> <span style={{ color: '#888' }}>{rev.date}</span>
              <p>{rev.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;