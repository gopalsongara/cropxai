import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SoilWorkflowProvider } from './context/SoilWorkflowContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SettingsProvider>
          <AuthProvider>
            <SoilWorkflowProvider>
              <App />
            </SoilWorkflowProvider>
          </AuthProvider>
        </SettingsProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
