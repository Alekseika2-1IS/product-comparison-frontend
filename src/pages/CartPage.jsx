import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateQuantity, getCartTotal, checkout } from '../services/cartService';

const CartPage = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
    setTotal(getCartTotal());
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    loadCart();
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
    loadCart();
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Для оформления заказа необходимо войти');
      return;
    }
    // Эмуляция оформления
    const order = checkout({ userId: user.id, userLogin: user.login });
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      navigate('/');
    }, 3000);
  };

  if (orderPlaced) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Заказ оформлен! Спасибо за покупку!</div>;
  }

  if (cart.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Корзина пуста. Перейдите в <a href="/">каталог</a></div>;
  }

  return (
    <div>
      <h2>Корзина</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={cellStyle}>Товар</th>
            <th style={cellStyle}>Цена</th>
            <th style={cellStyle}>Количество</th>
            <th style={cellStyle}>Сумма</th>
            <th style={cellStyle}></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={cellStyle}>{item.name}</td>
              <td style={cellStyle}>{item.price} руб.</td>
              <td style={cellStyle}>
                <input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))} style={{ width: '60px' }} />
              </td>
              <td style={cellStyle}>{item.price * item.quantity} руб.</td>
              <td style={cellStyle}>
                <button onClick={() => handleRemove(item.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #ccc' }}>
            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Итого:</td>
            <td style={{ fontWeight: 'bold' }}>{total} руб.</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={handleCheckout} style={buttonStyle}>Оформить заказ</button>
      </div>
    </div>
  );
};

const cellStyle = { padding: '8px', textAlign: 'left' };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default CartPage;