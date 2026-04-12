const RATINGS_KEY = 'product_ratings';

// Получить все рейтинги
export const getAllRatings = () => {
  const data = localStorage.getItem(RATINGS_KEY);
  return data ? JSON.parse(data) : {};
};

// Получить рейтинг товара
export const getProductRating = (productId) => {
  const ratings = getAllRatings();
  const productRatings = ratings[productId];
  if (!productRatings || productRatings.length === 0) return { average: 0, count: 0 };
  const sum = productRatings.reduce((acc, r) => acc + r.stars, 0);
  return { average: sum / productRatings.length, count: productRatings.length, reviews: productRatings };
};

// Добавить отзыв и оценку
export const addReview = (productId, userId, userName, stars, comment) => {
  const ratings = getAllRatings();
  if (!ratings[productId]) ratings[productId] = [];
  ratings[productId].push({
    id: Date.now(),
    userId,
    userName,
    stars,
    comment,
    date: new Date().toISOString()
  });
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  return getProductRating(productId);
};