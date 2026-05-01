import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from '../pages/Dashboard';
import { PestDetection } from '../pages/PestDetection';
import { AiChat } from '../pages/AiChat';
import { MarketInsights } from '../pages/MarketInsights';
import { CropRecommendation } from '../pages/CropRecommendation';
import { CropDetail } from '../pages/CropDetail';
import { SoilRequest } from '../pages/SoilRequest';
import { LabStatus } from '../pages/LabStatus';
import { SoilReport } from '../pages/SoilReport';
import { AiAnalysis } from '../pages/AiAnalysis';
import { IrrigationAdvice } from '../pages/IrrigationAdvice';
import { LabDashboard } from '../pages/LabDashboard';
import { ReportDetails } from '../pages/lab-admin/ReportDetails';
import { FarmerProfile } from '../pages/lab-admin/FarmerProfile';
import { LabProcessing } from '../pages/LabProcessing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ProfilePage } from '../pages/ProfilePage';
import { PestReport } from '../pages/PestReport';
import { AdminRoute, ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();
  const defaultPath = role === 'labadmin' ? '/lab-dashboard' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? defaultPath : '/login'} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <Register />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          
          <ProtectedRoute>
            <Dashboard />

            </ProtectedRoute>
          
        }
      />
      <Route
        path="/pest-detection"
        element={
          
          <ProtectedRoute>  <PestDetection />

            </ProtectedRoute>
          
        }
      />
      <Route
        path="/pest-report/:id"
        element={
          <ProtectedRoute>
            <PestReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          
         <ProtectedRoute>
           <AiChat />
         </ProtectedRoute>   
        
        }
      />
      <Route
        path="/market-insights"
        element={
        <ProtectedRoute> <MarketInsights /></ProtectedRoute>
           
        
        }
      />
      <Route
        path="/crop-recommendation"
        element={

          <ProtectedRoute>   <CropRecommendation /></ProtectedRoute>
          
         
          
        }
      />
      <Route
        path="/crop/:cropName"
        element={
          <ProtectedRoute>
            <CropDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/soil-request"
        element={
          
          <ProtectedRoute> 
             <SoilRequest />
          </ProtectedRoute>
        
          
        }
      />
      <Route
        path="/lab-processing"
        element={
          <ProtectedRoute>
            <LabProcessing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-status"
        element={
          <ProtectedRoute>
            <LabStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-dashboard"
        element={
          <AdminRoute>
            <LabDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/lab-admin/report/:id"
        element={
          <AdminRoute>
            <ReportDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/lab-admin/farmer/:farmerKey"
        element={
          <AdminRoute>
            <FarmerProfile />
          </AdminRoute>
        }
      />
      <Route
        path="/soil-report"
        element={
          <ProtectedRoute>
            <SoilReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-analysis"
        element={
          <ProtectedRoute>
            <AiAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/irrigation-advice"
        element={
          <ProtectedRoute>
            <IrrigationAdvice />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};


