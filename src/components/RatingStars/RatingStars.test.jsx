import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RatingStars from './RatingStars';
import { getRating, getUserRating, setRating } from '../../services/ratingsService';
import { getCurrentUser } from '../../services/authService';

jest.mock('../../services/ratingsService');
jest.mock('../../services/authService');

describe('RatingStars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUser.mockReturnValue(null);
    getRating.mockResolvedValue(4.2); // важно: возвращаем число
    getUserRating.mockResolvedValue(null);
    setRating.mockResolvedValue();
  });

  test('отображает звёзды', async () => {
    render(<RatingStars productId="1" readonly={true} />);
    // Ждём, пока компонент загрузит рейтинг и отрисует звёзды
    await waitFor(() => {
      const stars = screen.getAllByText('★');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  test('при клике на звезду (авторизован) вызывается setRating', async () => {
    getCurrentUser.mockReturnValue({ id: 'user1' });
    const onRatingUpdate = jest.fn();
    render(<RatingStars productId="1" onRatingUpdate={onRatingUpdate} readonly={false} />);
    
    await waitFor(() => screen.getAllByText('★')); // ждём появления звёзд
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[0]);
    
    expect(setRating).toHaveBeenCalledWith('1', 'user1', 1);
    await waitFor(() => expect(onRatingUpdate).toHaveBeenCalled());
  });
});