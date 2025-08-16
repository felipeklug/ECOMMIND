/**
 * Toast Hook
 * Simple toast notification system
 */

'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;

// Global toast state
let globalToastState: ToastState = {
  toasts: [],
};

const listeners = new Set<(state: ToastState) => void>();

function dispatch(action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'ADD_TOAST':
      globalToastState = {
        ...globalToastState,
        toasts: [...globalToastState.toasts, action.payload],
      };
      break;
    case 'REMOVE_TOAST':
      globalToastState = {
        ...globalToastState,
        toasts: globalToastState.toasts.filter(t => t.id !== action.payload),
      };
      break;
    case 'DISMISS_TOAST':
      globalToastState = {
        ...globalToastState,
        toasts: globalToastState.toasts.map(t =>
          t.id === action.payload ? { ...t, open: false } : t
        ),
      };
      break;
  }

  listeners.forEach(listener => listener(globalToastState));
}

export function useToast() {
  const [state, setState] = useState<ToastState>(globalToastState);

  // Subscribe to global state changes
  useState(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  });

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = (++toastCount).toString();
      const toastItem: Toast = {
        id,
        title,
        description,
        variant,
        duration,
      };

      dispatch({ type: 'ADD_TOAST', payload: toastItem });

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_TOAST', payload: id });
        }, duration);
      }

      return {
        id,
        dismiss: () => dispatch({ type: 'REMOVE_TOAST', payload: id }),
        update: (props: Partial<Toast>) => {
          dispatch({
            type: 'ADD_TOAST',
            payload: { ...toastItem, ...props },
          });
        },
      };
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      dispatch({ type: 'REMOVE_TOAST', payload: toastId });
    } else {
      // Dismiss all toasts
      state.toasts.forEach(toast => {
        dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
      });
    }
  }, [state.toasts]);

  return {
    ...state,
    toast,
    dismiss,
  };
}
