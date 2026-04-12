// src/services/ratingsService.js

const RATINGS_KEY = 'product_ratings';
const REVIEWS_KEY = 'product_reviews';

const init = () => {
  if (!localStorage.getItem(RATINGS_KEY)) {
    localStorage.setItem(RATINGS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(REVIEWS_KEY)) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify([]));
  }
};

export const getProductRating = (productId) => {
  init();
  const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY));
  const productRatings = ratings.filter(r => r.productId === productId);
  const average = productRatings.length
    ? productRatings.reduce((sum, r) => sum + r.rating, 0) / productRatings.length
    : 0;
  return { average, count: productRatings.length };
};

export const getRating = (productId) => {
  return getProductRating(productId).average;
};

export const getUserRating = (productId, userId) => {
  init();
  const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY));
  const userRating = ratings.find(r => r.productId === productId && r.userId === userId);
  return userRating ? userRating.rating : null;
};

export const setRating = (productId, userId, rating) => {
  init();
  const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY));
  const existingIndex = ratings.findIndex(r => r.productId === productId && r.userId === userId);
  if (existingIndex !== -1) {
    ratings[existingIndex].rating = rating;
  } else {
    ratings.push({ productId, userId, rating });
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
};

export const addReview = (productId, userId, author, text, rating) => {
  init();
  if (rating) {
    setRating(productId, userId, rating);
  }
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY));
  const newReview = {
    id: Date.now(),
    productId,
    userId,
    author,
    text,
    rating,
    date: new Date().toLocaleString()
  };
  reviews.push(newReview);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return newReview;
};

export const getReviews = (productId) => {
  init();
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY));
  return reviews.filter(r => r.productId === productId);
};

// Дополнительная функция для удаления отзыва (по id)
export const deleteReview = (reviewId) => {
  init();
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY));
  const updatedReviews = reviews.filter(r => r.id !== reviewId);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updatedReviews));
};