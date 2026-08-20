'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 size={16} color="#16a34a" />;
            case 'error':
              return <AlertCircle size={16} color="#e11d48" />;
            default:
              return <Info size={16} color="#2563eb" />;
          }
        };

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {getIcon()}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
