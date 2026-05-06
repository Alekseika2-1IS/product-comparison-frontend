import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RatingStars from './RatingStars';
import { setRating } from '../../services/ratingsService';
import { getCurrentUser } from '../../services/authService';

jest.mock('../../services/ratingsService');
jest.mock('../../services/authService');

describe('RatingStars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUser.mockReturnValue(null);
    setRating.mockResolvedValue();
  });

  test('отображает звёзды (readonly)', () => {
    // Передаём rating, чтобы компонент не пытался загружать рейтинг асинхронно
    render(<RatingStars productId="1" rating={4.5} readonly={true} />);
    // Проверяем, что есть хотя бы один элемент со звездой
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThan(0);
  });

  test('при клике на звезду (авторизован) вызывается setRating и onRatingUpdate', async () => {
    getCurrentUser.mockReturnValue({ id: 'user1' });
    const onRatingUpdate = jest.fn();
    // Передаём rating=0, чтобы компонент не загружал данные сам и не вызывал ошибок
    render(<RatingStars productId="1" rating={0} onRatingUpdate={onRatingUpdate} readonly={false} />);
    
    const stars = screen.getAllByText('★');
    // Кликаем на первую звезду (индекс 0)
    fireEvent.click(stars[0]);
    
    expect(setRating).toHaveBeenCalledWith('1', 'user1', 1);
    // Ждём асинхронных вызовов
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    expect(onRatingUpdate).toHaveBeenCalled();
  });
});