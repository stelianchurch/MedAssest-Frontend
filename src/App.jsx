import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import GlobalHeader from './components/layout/GlobalHeader';
import AppRoutes from './routes/AppRoutes';
import { SidebarProvider } from './context/SidebarContext';

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div dir="rtl" className="app-shell font-sans">
          <GlobalHeader />
          <main>
            <AppRoutes />
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}