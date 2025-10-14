import { useState, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
}

export interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface Provider {
  id: string;
  name: string;
  shopName: string;
  address: string;
  services?: Service[];
  businessHours?: BusinessHours[];
}

export const [BookingProvider, useBooking] = createContextHook(() => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSetSelectedProvider = useCallback((provider: Provider | null) => {
    setSelectedProvider(provider);
  }, []);

  const handleSetSelectedServices = useCallback((services: string[]) => {
    setSelectedServices(services);
  }, []);

  const handleSetSelectedDate = useCallback((date: string | null) => {
    setSelectedDate(date);
  }, []);

  const handleSetSelectedTime = useCallback((time: string | null) => {
    setSelectedTime(time);
  }, []);

  return useMemo(() => ({
    selectedProvider,
    selectedServices,
    selectedDate,
    selectedTime,
    setSelectedProvider: handleSetSelectedProvider,
    setSelectedServices: handleSetSelectedServices,
    setSelectedDate: handleSetSelectedDate,
    setSelectedTime: handleSetSelectedTime,
  }), [
    selectedProvider,
    selectedServices,
    selectedDate,
    selectedTime,
    handleSetSelectedProvider,
    handleSetSelectedServices,
    handleSetSelectedDate,
    handleSetSelectedTime,
  ]);
});