import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Navbar from './components/Common/Navbar';
import './index.css';
import './icons.css';
import './tabs.css';
import ProductList from './components/Products/ProductList';
import WarehouseList from './components/Warehouses/WarehouseList';
import React from 'react';
import Movements from './components/Movements/Movements';
import Login from './components/Login/Login';
import { useNavigate } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));

function UnauthorizedRedirect() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const redirectToLogin = () => {
      navigate('/login', { replace: true });
    };

    window.addEventListener('unauthorized', redirectToLogin);
    return () => window.removeEventListener('unauthorized', redirectToLogin);
  }, [navigate]);

  return null;
}

function MainPage() {
  const pages = [
    {
      value: '/products',
      name: 'Products'
    },
    {
      value: '/warehouses',
      name: 'Warehouses'
    },
    {
      value: '/movements',
      name: 'Movements'
    }
  ];
  const [title, setTitle] = React.useState('Inventory Management');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <BrowserRouter>
      <UnauthorizedRedirect />
      <Navbar title={title} user={user} setUser={setUser} pages={pages} />
      <Routes>
        <Route index element={<Navigate to="/movements" />} />
        <Route path="/products" element={<ProductList setTitle={setTitle} />} />
        <Route path="/warehouses" element={<WarehouseList setTitle={setTitle} />} />
        <Route path="/movements" element={<Movements setTitle={setTitle} />} />
        <Route path="/login" element={<Login setTitle={setTitle} setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

root.render(
    <MainPage />
);