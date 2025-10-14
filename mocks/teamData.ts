import { Provider } from '@/components/EditProviderModal';

export const mockTeamProviders: Provider[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    phone: '(555) 123-4567',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    role: 'admin',
    compensationModel: 'commission',
    commissionRate: 65,
    boothRentFee: 0,
    isActive: true,
    shopId: 'shop1',
    joinedDate: '2023-01-15',
    totalEarnings: 45000,
    clientCount: 120,
    occupancyRate: 85,
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '(555) 234-5678',
    profileImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    role: 'standard',
    compensationModel: 'booth_rent',
    commissionRate: 0,
    boothRentFee: 200,
    isActive: true,
    shopId: 'shop1',
    joinedDate: '2023-03-20',
    totalEarnings: 38000,
    clientCount: 95,
    occupancyRate: 78,
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@example.com',
    phone: '(555) 345-6789',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    role: 'standard',
    compensationModel: 'commission',
    commissionRate: 60,
    boothRentFee: 0,
    isActive: true,
    shopId: 'shop1',
    joinedDate: '2023-06-10',
    totalEarnings: 32000,
    clientCount: 78,
    occupancyRate: 72,
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    phone: '(555) 456-7890',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    role: 'associate',
    compensationModel: 'commission',
    commissionRate: 50,
    boothRentFee: 0,
    isActive: false,
    shopId: 'shop1',
    joinedDate: '2023-09-05',
    totalEarnings: 12000,
    clientCount: 35,
    occupancyRate: 45,
  },
  {
    id: '5',
    name: 'Michael Thompson',
    email: 'michael@example.com',
    phone: '(555) 567-8901',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    role: 'standard',
    compensationModel: 'commission',
    commissionRate: 62,
    boothRentFee: 0,
    isActive: true,
    shopId: 'shop1',
    joinedDate: '2023-04-12',
    totalEarnings: 41000,
    clientCount: 105,
    occupancyRate: 80,
  },
  {
    id: '6',
    name: 'Jessica Martinez',
    email: 'jessica@example.com',
    phone: '(555) 678-9012',
    profileImage: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
    role: 'standard',
    compensationModel: 'booth_rent',
    commissionRate: 0,
    boothRentFee: 180,
    isActive: true,
    shopId: 'shop1',
    joinedDate: '2023-07-08',
    totalEarnings: 29000,
    clientCount: 68,
    occupancyRate: 65,
  },
];

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export const mockMasterServiceList: Service[] = [
  { id: '1', name: 'Haircut', price: 55, duration: 30, isActive: true },
  { id: '2', name: 'Beard Trim', price: 30, duration: 15, isActive: true },
  { id: '3', name: 'Haircut & Beard', price: 75, duration: 45, isActive: true },
  { id: '4', name: 'Hot Towel Shave', price: 45, duration: 30, isActive: true },
  { id: '5', name: 'Hair Wash', price: 25, duration: 15, isActive: true },
  { id: '6', name: 'Mustache Trim', price: 20, duration: 10, isActive: true },
  { id: '7', name: 'Eyebrow Trim', price: 15, duration: 10, isActive: true },
  { id: '8', name: 'Full Service', price: 95, duration: 60, isActive: true },
];

export interface Appointment {
  id: string;
  providerId: string;
  clientName: string;
  clientId?: string;
  service: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  isManuallyAdded?: boolean;
}

export const mockProviderAppointments: Appointment[] = [
  {
    id: '1',
    providerId: '1',
    clientName: 'John Smith',
    clientId: 'client1',
    service: 'Haircut & Beard Trim',
    serviceId: '3',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 45,
    price: 75,
    status: 'completed',
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: '2',
    providerId: '1',
    clientName: 'Mike Johnson',
    clientId: 'client2',
    service: 'Haircut',
    serviceId: '1',
    date: '2024-01-15',
    time: '11:00 AM',
    duration: 30,
    price: 55,
    status: 'completed',
    createdAt: '2024-01-12T14:30:00Z',
  },
  {
    id: '3',
    providerId: '1',
    clientName: 'David Wilson',
    clientId: 'client3',
    service: 'Beard Styling',
    serviceId: '2',
    date: '2024-01-16',
    time: '2:00 PM',
    duration: 30,
    price: 35,
    status: 'upcoming',
    createdAt: '2024-01-14T11:15:00Z',
  },
  {
    id: '4',
    providerId: '2',
    clientName: 'Alex Brown',
    service: 'Full Service',
    serviceId: '8',
    date: '2024-01-16',
    time: '3:30 PM',
    duration: 60,
    price: 95,
    status: 'upcoming',
    createdAt: '2024-01-13T16:45:00Z',
    isManuallyAdded: true,
  },
  {
    id: '5',
    providerId: '3',
    clientName: 'Robert Davis',
    clientId: 'client4',
    service: 'Hot Towel Shave',
    serviceId: '4',
    date: '2024-01-17',
    time: '9:00 AM',
    duration: 30,
    price: 45,
    status: 'upcoming',
    createdAt: '2024-01-15T08:20:00Z',
  },
];

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  operatingHours: {
    day: string;
    hours: string;
    isOpen: boolean;
  }[];
  masterServiceList: Service[];
  ownerId: string;
  providers: string[]; // Provider IDs
}

export const mockShop: Shop = {
  id: 'shop1',
  name: 'Elite Barber Collective',
  address: '548 East 13th Street, New York, NY 10009',
  phone: '(347) 721-2262',
  email: 'info@elitebarbercollective.com',
  website: 'www.elitebarbercollective.com',
  instagram: '@elitebarbercollective',
  operatingHours: [
    { day: 'Monday', hours: '9:00 AM - 7:00 PM', isOpen: true },
    { day: 'Tuesday', hours: '9:00 AM - 7:00 PM', isOpen: true },
    { day: 'Wednesday', hours: '9:00 AM - 7:00 PM', isOpen: true },
    { day: 'Thursday', hours: '9:00 AM - 8:00 PM', isOpen: true },
    { day: 'Friday', hours: '9:00 AM - 8:00 PM', isOpen: true },
    { day: 'Saturday', hours: '8:00 AM - 6:00 PM', isOpen: true },
    { day: 'Sunday', hours: 'Closed', isOpen: false },
  ],
  masterServiceList: mockMasterServiceList,
  ownerId: 'owner1',
  providers: ['1', '2', '3', '4', '5', '6'],
};