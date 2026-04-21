import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/api';
import { getCurrentUser, isAdmin } from '../services/authService';

const AdminPage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
    loadProducts();
    loadOrders();
    loadUsers();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = () => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders([]);
    }
  };

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('app_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers([]);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Удалить товар?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  // Функция оформления заказа (удаление)
  const handleCompleteOrder = (orderId) => {
    if (window.confirm('Подтвердить оформление заказа? Заказ будет удалён из списка.')) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      alert('Заказ успешно оформлен!');
    }
  };

  return (
    <div>
      <h2>Админ-панель</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('products')} style={tabButtonStyle(activeTab === 'products')}>Товары</button>
        <button onClick={() => setActiveTab('orders')} style={tabButtonStyle(activeTab === 'orders')}>Заказы</button>
        <button onClick={() => setActiveTab('users')} style={tabButtonStyle(activeTab === 'users')}>Пользователи</button>
      </div>

      {activeTab === 'products' && (
        <div>
          <h3>Управление товарами</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Название</th>
                <th style={cellStyle}>Цена</th>
                <th style={cellStyle}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={cellStyle}>{product.id}</td>
                  <td style={cellStyle}>{product.name}</td>
                  <td style={cellStyle}>{product.price}</td>
                  <td style={cellStyle}>
                    <button onClick={() => handleDeleteProduct(product.id)} style={deleteButtonStyle}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3>Заказы</h3>
          {orders.length === 0 ? (
            <p>Нет заказов</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
                <p><strong>Заказ №{order.id}</strong> от {order.date}</p>
                <p>Пользователь: {order.userName || order.userId} (ID: {order.userId})</p>
                <p>Сумма: {order.total} руб.</p>
                <p>Статус: {order.status || 'новый'}</p>
                <details>
                  <summary>Состав заказа</summary>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.name} – {item.quantity} шт. x {item.price} руб.</li>
                    ))}
                  </ul>
                </details>
                <button onClick={() => handleCompleteOrder(order.id)} style={completeButtonStyle}>
                  Оформить заказ
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>Пользователи</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Логин</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={cellStyle}>{user.id}</td>
                  <td style={cellStyle}>{user.login}</td>
                  <td style={cellStyle}>{user.email}</td>
                  <td style={cellStyle}>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const tabButtonStyle = (isActive) => ({
  padding: '8px 16px',
  marginRight: '10px',
  backgroundColor: isActive ? '#2196F3' : '#f0f0f0',
  color: isActive ? 'white' : '#333',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

const cellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left'
};

const deleteButtonStyle = {
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer'
};

const completeButtonStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  cursor: 'pointer',
  marginTop: '10px'
};

export default AdminPage;