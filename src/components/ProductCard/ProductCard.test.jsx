import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

const mockOnSelect = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

const mockProduct = {
  id: 1,
  name: 'Тестовый товар',
  price: 999,
  imageUrl: 'https://via.placeholder.com/150'
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает название и цену товара', () => {
    render(
      <ProductCard
        product={mockProduct}
        onSelect={mockOnSelect}
        isSelected={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Тестовый товар')).toBeInTheDocument();
    expect(screen.getByText('999 руб.')).toBeInTheDocument();
  });

  it('вызывает onSelect при клике на чекбокс', () => {
    render(
      <ProductCard
        product={mockProduct}
        onSelect={mockOnSelect}
        isSelected={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnSelect).toHaveBeenCalledWith(1, true);
  });
});