// Database models for TheCut app

// User types
export type UserRole = 'client' | 'provider' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Shop model - Enhanced for TheCut functionality
export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  image?: string;
  ownerId: string;
  providerIds: string[]; // Array of Provider IDs working at this shop
  serviceIds: string[]; // Array of Service IDs offered at this shop
  hours: ShopOperatingHours; // Operating hours for the shop
  masterServiceList: Service[]; // Shop's master service list (deprecated - use serviceIds)
  createdAt: string;
  updatedAt: string;
}

// Provider model - Enhanced for multi-shop support and social features
export interface Provider {
  id: string;
  userId: string;
  shopIds: string[]; // Array of Shop IDs where this provider works
  isIndependent: boolean;
  specialties: string[];
  bio: string; // Required bio for provider profile
  experience?: string;
  portfolioImages: string[]; // Array of portfolio image URLs
  posts: ProviderPost[]; // Array of social media posts
  followerCount: number; // Number of followers for social features
  services: ProviderServiceOffering[]; // Services with custom pricing
  boothRentAmount?: number;
  boothRentDueDate?: string;
  boothRentFrequency?: 'weekly' | 'monthly';
  payoutSchedule: 'daily' | 'weekly' | 'monthly' | 'instant';
  rating?: number; // Average rating from reviews
  totalReviews?: number; // Total number of reviews
  isFollowed?: boolean; // Whether the current user is following this provider
  createdAt: string;
  updatedAt: string;
}

// Service model - Base service definition
export interface Service {
  id: string;
  name: string;
  description: string; // Required description
  baseDuration: number; // Base duration in minutes
  basePrice: number; // Base price (can be overridden by providers)
  isActive: boolean;
  category?: string; // Service category (e.g., 'haircut', 'coloring', 'styling')
  providerId?: string; // For independent providers
  shopId?: string; // For shop master service lists
  createdAt: string;
  updatedAt: string;
}

// Provider service offering - Enhanced with custom pricing and duration
export interface ProviderServiceOffering {
  id: string;
  providerId: string;
  serviceId: string; // References base service
  service: Service; // Full service object for easy access
  isOffered: boolean;
  customPrice?: number; // Provider's custom price (overrides basePrice)
  customDuration?: number; // Provider's custom duration (overrides baseDuration)
  shopId?: string; // Which shop this offering is for (if provider works at multiple shops)
  createdAt: string;
  updatedAt: string;
}

// TheCut-style Appointment Status System with State Machine
export type AppointmentStatus = 
  | 'requested'     // Client requests appointment (initial state)
  | 'confirmed'     // Provider confirms appointment
  | 'in-progress'   // Provider marks as started (new state)
  | 'completed'     // Provider marks as finished
  | 'cancelled'     // Either party cancels
  | 'no-show'       // Provider marks client as no-show
  | 'rescheduled';  // Either party reschedules (new state)

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed' | 'processing';

// State machine transitions - defines valid status changes
export const APPOINTMENT_STATE_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  'requested': ['confirmed', 'cancelled', 'rescheduled'],
  'confirmed': ['in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
  'in-progress': ['completed', 'cancelled'], // Can't reschedule once started
  'completed': [], // Terminal state
  'cancelled': ['requested'], // Can re-request if cancelled
  'no-show': [], // Terminal state
  'rescheduled': ['requested'] // Creates new appointment
};

// Permission matrix - who can perform which actions
export const APPOINTMENT_PERMISSIONS = {
  request: ['client'] as UserRole[],
  confirm: ['provider', 'owner'] as UserRole[],
  start: ['provider', 'owner'] as UserRole[],
  complete: ['provider', 'owner'] as UserRole[],
  cancel: ['client', 'provider', 'owner'] as UserRole[],
  mark_no_show: ['provider', 'owner'] as UserRole[],
  reschedule: ['client', 'provider', 'owner'] as UserRole[]
} as const;

export interface Appointment {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  shopId: string;
  
  // Scheduling Information
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
  duration: number; // Duration in minutes
  
  // Status Management (TheCut-style)
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  
  // Pricing Information
  serviceAmount: number; // Base service cost
  tipAmount: number; // Tip amount (default 0)
  taxAmount: number; // Tax amount
  totalAmount: number; // Total cost (service + tip + tax)
  
  // Notes and Communication
  clientNotes?: string; // Client's special requests
  providerNotes?: string; // Provider's internal notes
  publicNotes?: string; // Notes visible to both parties
  
  // Status-specific Information
  cancellationReason?: string;
  noShowReason?: string;
  rescheduleReason?: string;
  
  // Workflow Tracking
  confirmedAt?: string; // When provider confirmed
  startedAt?: string; // When service actually started
  completedAt?: string; // When service was completed
  
  // Communication Tracking
  reminderSent: boolean;
  confirmationSent: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  statusHistory: AppointmentStatusChange[];
  
  // Rescheduling Support
  originalAppointmentId?: string; // If this is a rescheduled appointment
  rescheduledToId?: string; // If this appointment was rescheduled
}

// Enhanced status change tracking with action context
export interface AppointmentStatusChange {
  id: string;
  appointmentId: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  changedBy: string; // userId
  changedByRole: UserRole;
  action: 'request' | 'confirm' | 'start' | 'complete' | 'cancel' | 'mark_no_show' | 'reschedule';
  reason?: string;
  metadata?: Record<string, any>; // Additional context (e.g., reschedule details)
  timestamp: string;
  
  // Client/Provider context
  clientNotified: boolean;
  providerNotified: boolean;
}

// Notification model for real-time updates
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_requested' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder' | 'payment_received';
  title: string;
  message: string;
  appointmentId?: string;
  read: boolean;
  createdAt: string;
}

// Payment model
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  tipAmount: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Review model
export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Team member model (for shop owners)
export interface TeamMember {
  id: string;
  providerId: string;
  shopId: string;
  role: 'provider' | 'manager' | 'receptionist';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics model
export interface Analytics {
  id: string;
  shopId?: string;
  stylistId?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  topServices: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Booth rent tracking model
export interface BoothRent {
  id: string;
  providerId: string;
  shopId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Availability models
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeInterval {
  start: string; // Format: "HH:MM" (24-hour)
  end: string;   // Format: "HH:MM" (24-hour)
}

export interface DayAvailability {
  day: DayOfWeek;
  isEnabled: boolean;
  intervals: TimeInterval[];
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  weeklySchedule: DayAvailability[];
  breaks?: {
    day: DayOfWeek;
    intervals: TimeInterval[];
  }[];
  createdAt: string;
  updatedAt: string;
}

// Shop operating hours (constrains provider availability)
export interface ShopOperatingHours {
  id: string;
  shopId: string;
  weeklyHours: DayAvailability[];
  createdAt: string;
  updatedAt: string;
}

// Available time slots for booking (generated from availability)
export interface AvailableTimeSlot {
  date: string;     // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  duration: number;  // in minutes
  isAvailable: boolean;
  providerId: string;
}

// Social media post model for providers
export interface ProviderPost {
  id: string;
  providerId: string;
  imageUrl: string;
  caption?: string;
  tags: string[]; // Hashtags or service tags
  likes: number;
  comments: PostComment[];
  createdAt: string;
  updatedAt: string;
}

// Comment model for provider posts
export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

// Client model - Enhanced for better user management
export interface Client {
  id: string;
  userId: string;
  preferredProviders: string[]; // Array of preferred provider IDs
  appointmentHistory: string[]; // Array of appointment IDs
  savedShops: string[]; // Array of saved shop IDs
  loyaltyPoints?: number;
  createdAt: string;
  updatedAt: string;
}