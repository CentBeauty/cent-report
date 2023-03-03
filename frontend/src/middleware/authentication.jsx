import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import LayoutComponent from '../components/layout/Layout';
export const AuthenticationMiddle = () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: location } }} replace />
    );
  }
  return <LayoutComponent><Outlet /></LayoutComponent>;
};