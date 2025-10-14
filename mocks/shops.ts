import { Shop } from '@/models/database';
import { mockProviders } from './providers';

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Free Advice Barber Shop',
    address: '548 East 13th Street',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    phone: '13477212262',
    email: 'info@freeadvicebarber.com',
    website: 'www.freeadvicebarber.com',
    description: 'Master barber shop with over 15 years of experience. Specializing in modern cuts, fades, and traditional techniques.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    ownerId: '1',
    providerIds: ['1', '2'], // Jose Santiago and team member
    serviceIds: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'],
    hours: {
      id: 'h1',
      shopId: '1',
      weeklyHours: [
        { day: 'monday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'tuesday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'wednesday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'thursday', isEnabled: true, intervals: [{ start: '09:00', end: '20:00' }] },
        { day: 'friday', isEnabled: true, intervals: [{ start: '09:00', end: '20:00' }] },
        { day: 'saturday', isEnabled: true, intervals: [{ start: '08:00', end: '18:00' }] },
        { day: 'sunday', isEnabled: false, intervals: [] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    masterServiceList: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Aura Barber & Beauty Studio',
    address: '234 Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10007',
    phone: '12125551234',
    email: 'info@aurabeauty.com',
    description: 'Premium cuts and styling services in a modern, upscale environment.',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800',
    ownerId: '2',
    providerIds: ['2', '8'], // Maria Lopez and Jessica Kim
    serviceIds: ['s9', 's10', 's11', 's12'],
    hours: {
      id: 'h2',
      shopId: '2',
      weeklyHours: [
        { day: 'monday', isEnabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
        { day: 'tuesday', isEnabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
        { day: 'wednesday', isEnabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
        { day: 'thursday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'friday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'saturday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'sunday', isEnabled: true, intervals: [{ start: '11:00', end: '17:00' }] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    masterServiceList: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Elite Cuts Barbershop',
    address: '789 5th Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10022',
    phone: '12125559012',
    email: 'contact@elitecuts.com',
    description: 'Traditional and modern barbering with a focus on precision and style.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    ownerId: '3',
    providerIds: ['4'], // James Wilson
    serviceIds: ['s13', 's14', 's15', 's16'],
    hours: {
      id: 'h3',
      shopId: '3',
      weeklyHours: [
        { day: 'monday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'tuesday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'wednesday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'thursday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'friday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'saturday', isEnabled: true, intervals: [{ start: '08:00', end: '17:00' }] },
        { day: 'sunday', isEnabled: false, intervals: [] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    masterServiceList: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Zen Nail Spa',
    address: '456 Park Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10016',
    phone: '12125555678',
    email: 'hello@zennailspa.com',
    website: 'www.zennailspa.com',
    description: 'Premium nail care and spa services in a tranquil, zen-inspired environment.',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800',
    ownerId: '4',
    providerIds: ['3'], // Lily Chen
    serviceIds: ['s17', 's18', 's19', 's20'],
    hours: {
      id: 'h4',
      shopId: '4',
      weeklyHours: [
        { day: 'monday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'tuesday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'wednesday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'thursday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'friday', isEnabled: true, intervals: [{ start: '10:00', end: '20:00' }] },
        { day: 'saturday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'sunday', isEnabled: true, intervals: [{ start: '11:00', end: '18:00' }] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    masterServiceList: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Glow Esthetics Studio',
    address: '567 Lexington Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10022',
    phone: '12125557890',
    email: 'info@glowestheticsstudio.com',
    website: 'www.glowestheticsstudio.com',
    description: 'Advanced skincare treatments and anti-aging services by licensed estheticians.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    ownerId: '5',
    providerIds: ['6'], // Amanda Rodriguez
    serviceIds: ['s21', 's22', 's23', 's24'],
    hours: {
      id: 'h5',
      shopId: '5',
      weeklyHours: [
        { day: 'monday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'tuesday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'wednesday', isEnabled: true, intervals: [{ start: '09:00', end: '19:00' }] },
        { day: 'thursday', isEnabled: true, intervals: [{ start: '09:00', end: '20:00' }] },
        { day: 'friday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
        { day: 'saturday', isEnabled: true, intervals: [{ start: '10:00', end: '17:00' }] },
        { day: 'sunday', isEnabled: false, intervals: [] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    masterServiceList: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Helper function to get shop by ID
export const getShopById = (id: string): Shop | undefined => {
  return mockShops.find(shop => shop.id === id);
};

// Helper function to get providers for a shop
export const getShopProviders = (shopId: string) => {
  const shop = getShopById(shopId);
  if (!shop) return [];
  
  return mockProviders.filter(provider => shop.providerIds.includes(provider.id));
};

// Helper function to calculate shop rating from providers
export const getShopRating = (shopId: string): { rating: number; reviewCount: number } => {
  const providers = getShopProviders(shopId);
  if (providers.length === 0) return { rating: 0, reviewCount: 0 };
  
  const totalRating = providers.reduce((sum, provider) => sum + provider.rating, 0);
  const totalReviews = providers.reduce((sum, provider) => sum + provider.reviewCount, 0);
  
  return {
    rating: Number((totalRating / providers.length).toFixed(1)),
    reviewCount: totalReviews
  };
};

// Helper function to get shop's starting price
export const getShopStartingPrice = (shopId: string): number => {
  const providers = getShopProviders(shopId);
  if (providers.length === 0) return 0;
  
  const prices = providers.flatMap(provider => 
    provider.services?.map(service => service.price) || []
  );
  
  return prices.length > 0 ? Math.min(...prices) : 0;
};