import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";
import { useAppointments } from "./AppointmentProvider";
import { confirmReservation, releaseReservation } from "@/utils/bookingService";

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover" | "paypal" | "applepay" | "googlepay" | "cash";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  cardholderName?: string;
  brand?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  subtotal: number;
  amount: number;
  tipAmount?: number;
  tipPercentage?: number;
  tipType?: "percentage" | "custom" | "none";
  clientId?: string;
  providerId?: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  paymentMethodType?: "card" | "applepay" | "googlepay" | "cash";
  transactionId?: string;
  receiptUrl?: string;
  gratuityTracking?: {
    taxYear: number;
    reportedAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayoutSettings {
  schedule: "daily" | "weekly" | "monthly" | "instant";
  accountType: "bank" | "paypal" | "venmo";
  accountDetails: {
    accountNumber?: string;
    routingNumber?: string;
    email?: string;
    phone?: string;
    bankName?: string;
    accountHolderName?: string;
  };
  instantPayoutFee: number;
  minimumPayout: number;
  nextPayoutDate?: string;
}

export interface Payout {
  id: string;
  providerId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  payoutMethod: "bank" | "paypal" | "venmo" | "instant";
  scheduledDate: string;
  processedDate?: string;
  transactionId?: string;
  paymentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  completedPayouts: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  averageTransactionAmount: number;
  totalTips: number;
  serviceRevenue: number;
}

export interface TipSettings {
  providerId: string;
  preferredPercentages: number[];
  allowCustomTip: boolean;
  allowNoTip: boolean;
  defaultPercentage?: number;
  thankYouMessage?: string;
  splitTipEnabled: boolean;
}

export const [PaymentProvider, usePayments] = createContextHook(() => {
  const { user, isDeveloperMode } = useAuth();
  const appointmentContext = useAppointments();
  const appointments = useMemo(() => appointmentContext?.appointments || [], [appointmentContext?.appointments]);
  const updateAppointmentStatus = appointmentContext?.updateAppointmentStatus || (() => Promise.resolve());
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [tipSettings, setTipSettings] = useState<TipSettings[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Use refs to track processing states and prevent race conditions
  const isProcessingRef = useRef<boolean>(false);
  const paymentQueueRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef<boolean>(true);

  // Development-only logging
  const log = useCallback((message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[PaymentProvider] ${message}`, data || '');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load payment data on mount and when user changes
  useEffect(() => {
    const loadPaymentData = async () => {
      log("loadPaymentData start");
      
      if (isProcessingRef.current || !mountedRef.current) {
        log("Load already in progress or component unmounted, skipping");
        return;
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) {
          log("No user, skipping load");
          return;
        }

        if (isDeveloperMode) {
          log("Loading mock payment data for developer mode");
          await loadMockData();
        } else {
          log("Loading persisted payment data");
          await loadPersistedData();
        }
      } catch (error) {
        console.error("[PaymentProvider] Error loading payment data:", error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    };

    loadPaymentData();
  }, [user, isDeveloperMode, log]);

  const loadMockData = useCallback(async () => {
    if (!user || !mountedRef.current) return;

    try {
      if (user.role === "client") {
        const mockPaymentMethods = user.mockData?.paymentMethods || [
          {
            id: "pm1",
            type: "visa" as const,
            last4: "4242",
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
            cardholderName: "John Doe",
            brand: "Visa",
          },
          {
            id: "pm2",
            type: "applepay" as const,
            isDefault: false,
          },
          {
            id: "pm3",
            type: "googlepay" as const,
            isDefault: false,
          },
          {
            id: "pm4",
            type: "cash" as const,
            isDefault: false,
          },
        ];
        setPaymentMethods(mockPaymentMethods);
      } else if (user.role === "provider" || user.role === "owner") {
        setPayoutSettings({
          schedule: "weekly",
          accountType: "bank",
          accountDetails: {
            accountNumber: "XXXX4567",
            routingNumber: "XXXX8901",
            bankName: "Chase Bank",
            accountHolderName: user.name || "Provider Name",
          },
          instantPayoutFee: 1.5,
          minimumPayout: 25,
          nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        
        // Mock payouts for demo
        const mockPayouts: Payout[] = [
          {
            id: "payout-1",
            providerId: user.id || "provider-1",
            amount: 450.00,
            fee: 0,
            netAmount: 450.00,
            status: "completed",
            payoutMethod: "bank",
            scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            processedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            transactionId: "tx-payout-001",
            paymentIds: ["payment-1", "payment-2"],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "payout-2",
            providerId: user.id || "provider-1",
            amount: 320.00,
            fee: 4.80,
            netAmount: 315.20,
            status: "processing",
            payoutMethod: "instant",
            scheduledDate: new Date().toISOString(),
            paymentIds: ["payment-3"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setPayouts(mockPayouts);
        
        const mockTipSettings: TipSettings = {
          providerId: user.id || "provider-1",
          preferredPercentages: [15, 18, 20, 25],
          allowCustomTip: true,
          allowNoTip: true,
          defaultPercentage: 18,
          thankYouMessage: "Thank you for your generous tip! 🙏",
          splitTipEnabled: true,
        };
        setTipSettings([mockTipSettings]);
      }
      setPayments([]);
    } catch (error) {
      console.error("[PaymentProvider] Error loading mock data:", error);
    }
  }, [user]);

  const loadPersistedData = useCallback(async () => {
    if (!user?.id || !mountedRef.current) return;

    try {
      const [
        storedPaymentMethods,
        storedPayoutSettings,
        storedPayments,
        storedTipSettings,
        storedPayouts
      ] = await Promise.all([
        AsyncStorage.getItem(`paymentMethods_${user.id}`),
        AsyncStorage.getItem(`payoutSettings_${user.id}`),
        AsyncStorage.getItem(`payments_${user.id}`),
        AsyncStorage.getItem(`tipSettings_${user.id}`),
        AsyncStorage.getItem(`payouts_${user.id}`)
      ]);

      if (!mountedRef.current) return;

      if (storedPaymentMethods) setPaymentMethods(JSON.parse(storedPaymentMethods));
      if (storedPayoutSettings) setPayoutSettings(JSON.parse(storedPayoutSettings));
      if (storedPayments) setPayments(JSON.parse(storedPayments));
      if (storedTipSettings) setTipSettings(JSON.parse(storedTipSettings));
      if (storedPayouts) setPayouts(JSON.parse(storedPayouts));
    } catch (error) {
      console.error("[PaymentProvider] Error loading persisted data:", error);
    }
  }, [user?.id]);

  const persistPayments = useCallback(
    async (updated: Payment[]) => {
      log("persistPayments", updated.length);
      if (!mountedRef.current) return;
      
      setPayments(updated);
      if (!isDeveloperMode && user?.id) {
        try {
          await AsyncStorage.setItem(`payments_${user.id}`, JSON.stringify(updated));
        } catch (error) {
          console.error("[PaymentProvider] Error persisting payments:", error);
        }
      }
    },
    [isDeveloperMode, user?.id, log]
  );

  const requestPaymentForAppointment = useCallback(
    async (
      appointmentId: string,
      opts?: { clientId?: string; totalServiceCost?: number }
    ) => {
      log("requestPaymentForAppointment", appointmentId);
      
      // Prevent duplicate requests
      if (paymentQueueRef.current.has(appointmentId)) {
        log("Payment request already in progress for appointment", appointmentId);
        return payments.find((p) => p.appointmentId === appointmentId);
      }
      
      paymentQueueRef.current.add(appointmentId);
      
      try {
        const existing = payments.find((p) => p.appointmentId === appointmentId);
        if (existing) return existing;
        
        const apt = appointments.find((a) => a.id === appointmentId);
        if (!apt) throw new Error("Appointment not found");
        
        const subtotal = opts?.totalServiceCost ?? apt.totalAmount ?? 0;
        const newPayment: Payment = {
          id: `payment-${Date.now()}`,
          appointmentId,
          subtotal,
          amount: subtotal,
          tipAmount: 0,
          tipPercentage: 0,
          tipType: "none",
          clientId: opts?.clientId ?? (user?.role === "client" ? user.id : undefined),
          providerId: apt.providerId || "provider-1",
          status: "pending",
          paymentMethodType: "card",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedPayments = [...payments, newPayment];
        await persistPayments(updatedPayments);
        return newPayment;
      } catch (error) {
        console.error("[PaymentProvider] Error requesting payment for appointment:", error);
        throw error;
      } finally {
        paymentQueueRef.current.delete(appointmentId);
      }
    },
    [appointments, payments, persistPayments, user?.id, user?.role, log]
  );

  // Auto-create payments for completed appointments
  useEffect(() => {
    const processCompletedAppointments = async () => {
      if (!mountedRef.current) return;
      
      const completedAppointments = appointments.filter((a) => a.status === "completed");
      
      for (const apt of completedAppointments) {
        const paymentExists = payments.some((p) => p.appointmentId === apt.id);
        if (!paymentExists && !paymentQueueRef.current.has(apt.id)) {
          try {
            await requestPaymentForAppointment(apt.id);
          } catch (error) {
            log("Auto payment request error for appointment", { appointmentId: apt.id, error });
          }
        }
      }
    };

    processCompletedAppointments();
  }, [appointments, payments, requestPaymentForAppointment, log]);

  const addPaymentMethod = useCallback(
    async (paymentMethod: Omit<PaymentMethod, "id">) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");

        const newPaymentMethod: PaymentMethod = {
          ...paymentMethod,
          id: `pm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        let updatedPaymentMethods: PaymentMethod[];
        if (paymentMethod.isDefault || paymentMethods.length === 0) {
          updatedPaymentMethods = paymentMethods.map((pm) => ({
            ...pm,
            isDefault: false,
          }));
          updatedPaymentMethods.push({ ...newPaymentMethod, isDefault: true });
        } else {
          updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
        }

        if (mountedRef.current) {
          setPaymentMethods(updatedPaymentMethods);
        }

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return newPaymentMethod;
      } catch (error) {
        console.error("[PaymentProvider] Error adding payment method:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const removePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");

        const methodToRemove = paymentMethods.find((pm) => pm.id === paymentMethodId);
        if (!methodToRemove) throw new Error("Payment method not found");

        let updatedPaymentMethods = paymentMethods.filter((pm) => pm.id !== paymentMethodId);

        // If removing default and there are other methods, set first as default
        if (methodToRemove.isDefault && updatedPaymentMethods.length > 0) {
          updatedPaymentMethods[0].isDefault = true;
        }

        if (mountedRef.current) {
          setPaymentMethods(updatedPaymentMethods);
        }

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return true;
      } catch (error) {
        console.error("[PaymentProvider] Error removing payment method:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const setDefaultPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");

        const updatedPaymentMethods = paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }));

        if (mountedRef.current) {
          setPaymentMethods(updatedPaymentMethods);
        }

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return updatedPaymentMethods.find((pm) => pm.id === paymentMethodId);
      } catch (error) {
        console.error("[PaymentProvider] Error setting default payment method:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const processPayment = useCallback(
    async (
      appointmentId: string,
      amount: number,
      tipAmount: number,
      paymentMethodId: string,
      tipType: "percentage" | "custom" | "none" = "none",
      reservationId?: string
    ) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");

        const foundMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);
        const tipPercentage = tipAmount > 0 ? Math.round((tipAmount / (amount - tipAmount)) * 100) : 0;

        const existing = payments.find((p) => p.appointmentId === appointmentId);
        const base: Payment =
          existing ?? {
            id: `payment-${Date.now()}`,
            appointmentId,
            subtotal: amount - tipAmount,
            amount,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

        const pendingPayment: Payment = {
          ...base,
          subtotal: amount - tipAmount,
          amount,
          tipAmount,
          tipPercentage,
          tipType,
          status: "processing",
          paymentMethod: foundMethod?.id ?? paymentMethodId,
          paymentMethodType: foundMethod?.type === "applepay" ? "applepay" : 
                           foundMethod?.type === "googlepay" ? "googlepay" :
                           foundMethod?.type === "cash" ? "cash" : "card",
          gratuityTracking: tipAmount > 0 ? {
            taxYear: new Date().getFullYear(),
            reportedAmount: tipAmount,
          } : undefined,
          updatedAt: new Date().toISOString(),
        };

        const pendingUpdated = existing
          ? payments.map((p) => (p.id === existing.id ? pendingPayment : p))
          : [...payments, pendingPayment];
        await persistPayments(pendingUpdated);

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const completedPayment: Payment = {
          ...pendingPayment,
          status: "completed",
          transactionId: `tx-${Date.now()}`,
          receiptUrl: `https://receipts.bookerpro.com/${pendingPayment.id}`,
          updatedAt: new Date().toISOString(),
        };

        const finalUpdated = pendingUpdated.map((p) => 
          p.id === pendingPayment.id ? completedPayment : p
        );
        await persistPayments(finalUpdated);

        // If this is a reservation-based booking, confirm the reservation
        if (reservationId) {
          const confirmationResult = confirmReservation(reservationId, {
            totalAmount: amount,
            serviceAmount: amount - tipAmount,
            tipAmount,
            paymentMethod: foundMethod?.id ?? paymentMethodId,
          });
          
          if (!confirmationResult.success) {
            throw new Error(confirmationResult.error || "Failed to confirm reservation");
          }
          
          log("Reservation confirmed:", confirmationResult.appointmentId);
        } else {
          await updateAppointmentStatus(appointmentId, "confirmed");
        }

        return completedPayment;
      } catch (error) {
        console.error("[PaymentProvider] Error processing payment:", error);
        
        // If payment failed and we have a reservation, release it
        if (reservationId) {
          log("Releasing reservation due to payment failure:", reservationId);
          releaseReservation(reservationId);
        }
        
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [payments, paymentMethods, user, persistPayments, updateAppointmentStatus, log]
  );

  const updatePayoutSettings = useCallback(
    async (settings: PayoutSettings) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot set payout settings");

        if (mountedRef.current) {
          setPayoutSettings(settings);
        }

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `payoutSettings_${user.id}`,
            JSON.stringify(settings)
          );
        }

        return settings;
      } catch (error) {
        console.error("[PaymentProvider] Error updating payout settings:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [user, isDeveloperMode]
  );

  const calculateTipSuggestions = useCallback((amount: number, providerId?: string) => {
    const providerTipSettings = tipSettings.find(ts => ts.providerId === providerId);
    const percentages = providerTipSettings?.preferredPercentages || [15, 18, 20, 25];
    
    return {
      suggestions: percentages.map(pct => ({
        percentage: pct,
        amount: Math.round(amount * (pct / 100)),
        label: `${pct}%`
      })),
      allowCustom: providerTipSettings?.allowCustomTip ?? true,
      allowNoTip: providerTipSettings?.allowNoTip ?? true,
      defaultPercentage: providerTipSettings?.defaultPercentage ?? 18,
      thankYouMessage: providerTipSettings?.thankYouMessage,
    };
  }, [tipSettings]);

  const updateTipSettings = useCallback(
    async (providerId: string, settings: Partial<TipSettings>) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot set tip settings");

        const existingIndex = tipSettings.findIndex(ts => ts.providerId === providerId);
        let updatedTipSettings: TipSettings[];
        
        if (existingIndex >= 0) {
          updatedTipSettings = tipSettings.map((ts, index) => 
            index === existingIndex ? { ...ts, ...settings } : ts
          );
        } else {
          const newTipSettings: TipSettings = {
            providerId,
            preferredPercentages: [15, 18, 20, 25],
            allowCustomTip: true,
            allowNoTip: true,
            splitTipEnabled: false,
            ...settings,
          };
          updatedTipSettings = [...tipSettings, newTipSettings];
        }

        if (mountedRef.current) {
          setTipSettings(updatedTipSettings);
        }

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `tipSettings_${user.id}`,
            JSON.stringify(updatedTipSettings)
          );
        }

        return updatedTipSettings.find(ts => ts.providerId === providerId);
      } catch (error) {
        console.error("[PaymentProvider] Error updating tip settings:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [tipSettings, user, isDeveloperMode]
  );

  const calculateEarnings = useCallback((): EarningsData => {
    const completedPayments = payments.filter(p => p.status === "completed" && p.providerId === user?.id);
    const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTips = completedPayments.reduce((sum, p) => sum + (p.tipAmount || 0), 0);
    const serviceRevenue = totalEarnings - totalTips;
    
    const completedPayouts = payouts.filter(p => p.status === "completed" && p.providerId === user?.id);
    const pendingPayments = completedPayments.filter(p => 
      !payouts.some(payout => payout.paymentIds.includes(p.id) && payout.status === "completed")
    );
    const pendingEarnings = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekPayments = completedPayments.filter(p => new Date(p.createdAt) >= oneWeekAgo);
    const thisMonthPayments = completedPayments.filter(p => new Date(p.createdAt) >= oneMonthAgo);
    
    const thisWeekEarnings = thisWeekPayments.reduce((sum, p) => sum + p.amount, 0);
    const thisMonthEarnings = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalEarnings,
      pendingEarnings,
      completedPayouts: completedPayouts.reduce((sum, p) => sum + p.netAmount, 0),
      thisWeekEarnings,
      thisMonthEarnings,
      averageTransactionAmount: completedPayments.length > 0 ? totalEarnings / completedPayments.length : 0,
      totalTips,
      serviceRevenue,
    };
  }, [payments, payouts, user?.id]);

  const requestInstantPayout = useCallback(
    async (amount: number) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot request payouts");
        if (!payoutSettings) throw new Error("Payout settings not configured");
        
        const fee = amount * (payoutSettings.instantPayoutFee / 100);
        const netAmount = amount - fee;
        
        if (amount < payoutSettings.minimumPayout) {
          throw new Error(`Minimum payout amount is ${payoutSettings.minimumPayout}`);
        }
        
        const pendingPayments = payments.filter(p => 
          p.status === "completed" && 
          p.providerId === user.id &&
          !payouts.some(payout => payout.paymentIds.includes(p.id))
        );
        
        const availableAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
        if (amount > availableAmount) {
          throw new Error("Insufficient available earnings");
        }
        
        const newPayout: Payout = {
          id: `payout-${Date.now()}`,
          providerId: user.id || "provider-1",
          amount,
          fee,
          netAmount,
          status: "processing",
          payoutMethod: "instant",
          scheduledDate: new Date().toISOString(),
          paymentIds: pendingPayments.slice(0, Math.ceil(pendingPayments.length * (amount / availableAmount))).map(p => p.id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedPayouts = [...payouts, newPayout];
        if (mountedRef.current) {
          setPayouts(updatedPayouts);
        }
        
        if (!isDeveloperMode) {
          await AsyncStorage.setItem(`payouts_${user.id}`, JSON.stringify(updatedPayouts));
        }
        
        // Simulate processing time
        setTimeout(async () => {
          if (!mountedRef.current) return;
          
          const completedPayout = {
            ...newPayout,
            status: "completed" as const,
            processedDate: new Date().toISOString(),
            transactionId: `tx-instant-${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };
          
          const finalPayouts = updatedPayouts.map(p => p.id === newPayout.id ? completedPayout : p);
          if (mountedRef.current) {
            setPayouts(finalPayouts);
          }
          
          if (!isDeveloperMode) {
            await AsyncStorage.setItem(`payouts_${user.id}`, JSON.stringify(finalPayouts));
          }
        }, 3000);
        
        return newPayout;
      } catch (error) {
        console.error("[PaymentProvider] Error requesting instant payout:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [user, payoutSettings, payments, payouts, isDeveloperMode]
  );

  const getPayoutHistory = useCallback(() => {
    return payouts.filter(p => p.providerId === user?.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [payouts, user?.id]);

  const validatePaymentSecurity = useCallback(
    async (paymentData: any) => {
      log("Validating payment security...");
      
      // Simulate fraud detection
      const fraudScore = Math.random();
      if (fraudScore > 0.95) {
        throw new Error("Transaction flagged for potential fraud");
      }
      
      // Simulate encryption
      const encryptedData = {
        ...paymentData,
        cardNumber: paymentData.cardNumber ? "****" + paymentData.cardNumber.slice(-4) : undefined,
        cvv: "***",
      };
      
      return {
        isValid: true,
        encryptedData,
        fraudScore,
        complianceCheck: "PCI-DSS Level 1",
      };
    },
    [log]
  );

  const processStripePayment = useCallback(
    async (
      amount: number,
      paymentMethodId: string,
      reservationId?: string
    ) => {
      log("Processing Stripe payment...");
      
      // Mock Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success/failure
      const success = Math.random() > 0.1; // 90% success rate
      
      if (!success) {
        throw new Error("Payment failed. Please try again.");
      }
      
      return {
        paymentIntentId: `pi_${Date.now()}`,
        status: "succeeded",
        amount,
        paymentMethodId,
      };
    },
    [log]
  );

  const releaseSlotReservation = useCallback(
    (reservationId: string) => {
      log("Releasing slot reservation:", reservationId);
      return releaseReservation(reservationId);
    },
    [log]
  );

  const splitTip = useCallback(
    async (paymentId: string, splits: { providerId: string; amount: number }[]) => {
      if (isProcessingRef.current || !mountedRef.current) {
        throw new Error("Another payment operation is in progress or component unmounted");
      }
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!user) throw new Error("User not authenticated");
        
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) throw new Error("Payment not found");
        
        const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
        if (totalSplitAmount !== (payment.tipAmount || 0)) {
          throw new Error("Split amounts must equal total tip amount");
        }
        
        // Create individual tip records for each provider
        const splitPayments = splits.map(split => ({
          ...payment,
          id: `${payment.id}-split-${split.providerId}-${Date.now()}`,
          providerId: split.providerId,
          tipAmount: split.amount,
          amount: split.amount,
          subtotal: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        const updatedPayments = [...payments, ...splitPayments];
        await persistPayments(updatedPayments);
        
        return splitPayments;
      } catch (error) {
        console.error("[PaymentProvider] Error splitting tip:", error);
        throw error;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    },
    [payments, user, persistPayments]
  );

  const generateReceipt = useCallback(
    async (paymentId: string) => {
      try {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) throw new Error("Payment not found");
        
        const appointment = appointments.find(a => a.id === payment.appointmentId);
        if (!appointment) throw new Error("Appointment not found");
        
        // In a real app, this would generate and email a receipt
        const receiptData = {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          date: payment.updatedAt,
          subtotal: payment.subtotal,
          tip: payment.tipAmount || 0,
          total: payment.amount,
          paymentMethod: payment.paymentMethodType,
          service: `Service ${appointment.serviceId}`,
          provider: `Provider ${appointment.providerId}`,
        };
        
        log("Receipt generated:", receiptData);
        return receiptData;
      } catch (error) {
        console.error("[PaymentProvider] Error generating receipt:", error);
        throw error;
      }
    },
    [payments, appointments, log]
  );

  return useMemo(
    () => ({
      paymentMethods,
      payments,
      payouts,
      payoutSettings,
      tipSettings,
      isLoading,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      processPayment,
      updatePayoutSettings,
      updateTipSettings,
      calculateTipSuggestions,
      requestPaymentForAppointment,
      splitTip,
      generateReceipt,
      calculateEarnings,
      requestInstantPayout,
      getPayoutHistory,
      validatePaymentSecurity,
      processStripePayment,
      releaseSlotReservation,
    }),
    [
      paymentMethods,
      payments,
      payouts,
      payoutSettings,
      tipSettings,
      isLoading,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      processPayment,
      updatePayoutSettings,
      updateTipSettings,
      calculateTipSuggestions,
      requestPaymentForAppointment,
      splitTip,
      generateReceipt,
      calculateEarnings,
      requestInstantPayout,
      getPayoutHistory,
      validatePaymentSecurity,
      processStripePayment,
      releaseSlotReservation,
    ]
  );
});