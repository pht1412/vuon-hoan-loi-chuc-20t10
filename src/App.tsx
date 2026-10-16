import React, { useState, useEffect } from 'react';
import { GardenPage } from './pages/GardenPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'garden' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/admin' || hash === '#/admin' || hash === '#admin' ? 'admin' : 'garden';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('garden');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = '#/admin';
    }
    setCurrentRoute('admin');
  };

  const navigateToGarden = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setCurrentRoute('garden');
  };

  if (currentRoute === 'admin') {
    return <AdminPage onBackToGarden={navigateToGarden} />;
  }

  return <GardenPage onNavigateToAdmin={navigateToAdmin} />;
};

export default App;
