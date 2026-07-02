import { useEffect, useRef } from 'react';
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';

/**
 * useNotifications — real-time WebSocket alerts.
 * Connects to backend WebSocket endpoint for live notifications.
 *
 * Usage: call once at the root layout level (DashboardLayout)
 */
const useNotifications = () => {
  const { isAuthenticated, user } = useAuthStore();
  const addNotification = useUIStore((s) => s.addNotification);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to role-specific WebSocket endpoint
    const role = user.role?.toLowerCase() || 'admin';
    const wsUrl = `ws://localhost:8000/api/v1/ws/${role}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // WebSocket connected successfully
    };

    wsRef.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        addNotification({
          id: payload.id || Date.now(),
          title: payload.title || 'New Alert',
          message: payload.message || '',
          type: payload.type || 'info',
          timestamp: payload.timestamp || new Date().toISOString(),
          read: false,
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      // Silently handle WebSocket errors - connection will retry
    };

    wsRef.current.onclose = () => {
      // WebSocket disconnected
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, user, addNotification]);
};

export default useNotifications;
