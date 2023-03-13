import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import LayoutComponent from '../components/layout/Layout';
import linkEnum from '../enums/link.enum';
export const AuthenticationMiddle = () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return (
      <Navigate to={{ pathname: linkEnum.LOGIN_PAGE, state: { from: location } }} replace />
    );
  }
  return <LayoutComponent><Outlet /></LayoutComponent>;
};