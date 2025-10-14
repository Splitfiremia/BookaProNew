import React from 'react';
import { getReservationTimeRemaining } from './bookingService';

/**
 * Custom hook for managing reservation countdown timer
 * Usage: const { timeRemaining, isExpired, formatTime } = useReservationTimer(reservationId);
 */
export const useReservationTimer = (reservationId: string | null) => {
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    if (!reservationId) {
      setTimeRemaining(0);
      setIsExpired(false);
      return;
    }
    
    // Update timer immediately
    const updateTimer = () => {
      const remaining = getReservationTimeRemaining(reservationId);
      setTimeRemaining(remaining);
      setIsExpired(remaining <= 0);
    };
    
    updateTimer();
    
    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [reservationId]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return {
    timeRemaining,
    isExpired,
    formatTime: () => formatTime(timeRemaining)
  };
};

/**
 * Hook for managing reservation state during booking flow
 */
export const useReservationState = () => {
  const [reservationId, setReservationId] = React.useState<string | null>(null);
  const [isReserving, setIsReserving] = React.useState<boolean>(false);
  const [reservationError, setReservationError] = React.useState<string | null>(null);
  
  const timer = useReservationTimer(reservationId);
  
  const clearReservation = React.useCallback(() => {
    setReservationId(null);
    setReservationError(null);
  }, []);
  
  const setReservation = React.useCallback((id: string) => {
    setReservationId(id);
    setReservationError(null);
  }, []);
  
  const setError = React.useCallback((error: string) => {
    setReservationError(error);
  }, []);
  
  // Auto-clear reservation when timer expires
  React.useEffect(() => {
    if (timer.isExpired && reservationId) {
      console.log('Reservation expired, clearing state');
      clearReservation();
    }
  }, [timer.isExpired, reservationId, clearReservation]);
  
  return {
    reservationId,
    isReserving,
    reservationError,
    timer,
    setReservation,
    setIsReserving,
    setError,
    clearReservation
  };
};