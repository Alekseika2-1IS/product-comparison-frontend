import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  test('отображает средний рейтинг в звёздах (readonly)', () => {
    render(<RatingStars productId="1" rating={4.5} readonly={true} />);
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  test('при клике на звезду (авторизован) вызывается setRating', async () => {
    getCurrentUser.mockReturnValue({ id: 'user1' });
    const onRatingUpdate = jest.fn();
    render(<RatingStars productId="1" onRatingUpdate={onRatingUpdate} readonly={false} />);
    
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[3]);
    
    expect(setRating).toHaveBeenCalledWith('1', 'user1', 4);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(onRatingUpdate).toHaveBeenCalled();
  });
});