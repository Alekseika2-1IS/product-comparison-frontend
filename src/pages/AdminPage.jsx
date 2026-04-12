import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/api';
import ProductForm from '../components/ProductForm/ProductForm';

const AdminPage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadProducts();
      loadOrders();
      loadUsers();
    }
  }, [user]);

  const loadProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  const loadOrders = () => {
    const ordersData = localStorage.getItem('orders');
    setOrders(ordersData ? JSON.parse(ordersData) : []);
  };

  const loadUsers = () => {
    const usersData = localStorage.getItem('app_users');
    setUsers(usersData ? JSON.parse(usersData) : []);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Удалить товар?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    loadProducts();
  };

  if (!user || user.role !== 'admin') {
    return <div>Доступ запрещен</div>;
  }

  return (
    <div>
      <h2>Админ-панель</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('products')}>Товары</button>
        <button onClick={() => setActiveTab('orders')}>Заказы</button>
        <button onClick={() => setActiveTab('users')}>Пользователи</button>
      </div>

      {activeTab === 'products' && (
        <div>
          <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>+ Добавить товар</button>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr><th>ID</th><th>Название</th><th>Цена</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.price}</td>
                  <td><button onClick={() => handleEditProduct(p)}>Ред.</button> <button onClick={() => handleDeleteProduct(p.id)}>Удалить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? <p>Нет заказов</p> : orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
              <p>Заказ №{order.id} от {new Date(order.date).toLocaleString()}</p>
              <p>Пользователь: {order.userLogin}</p>
              <p>Сумма: {order.total} руб.</p>
              <p>Статус: {order.status}</p>
              <details><summary>Состав</summary><pre>{JSON.stringify(order.items, null, 2)}</pre></details>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>ID</th><th>Логин</th><th>Почта</th><th>Роль</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}><td>{u.id}</td><td>{u.login}</td><td>{u.email}</td><td>{u.role}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProductForm && (
        <ProductForm
          productToEdit={editingProduct}
          onClose={() => setShowProductForm(false)}
          onProductSaved={handleProductSaved}
        />
      )}
    </div>
  );
};

export default AdminPage;