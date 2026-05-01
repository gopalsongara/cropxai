import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#f3f7f4] flex text-slate-800 font-sans">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 flex flex-col min-h-screen ${isAuthPage ? '' : 'md:ml-64 pb-24 md:pb-8'}`}>
        {!isAuthPage && <Navbar />}
        <AppRoutes />
      </main>
    </div>
  );
};
