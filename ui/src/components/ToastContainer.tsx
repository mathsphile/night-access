'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ';
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
