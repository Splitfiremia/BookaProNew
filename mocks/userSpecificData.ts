import { mockAppointments } from './appointments';
import { mockProviders } from './providers';

// Client-specific data
export const clientData = {
  appointments: [
    ...mockAppointments,
    {
      id: "5",
      providerName: "Sarah Johnson",
      providerImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
      service: "Eyebrow Threading",
      status: "confirmed",
      day: "TUE",
      date: "16",
      month: "SEP",
      time: "3:30 PM - 3:45 PM",
      location: "Brow Bar NYC",
      price: 25
    }
  ],
  favoriteProviders: [
    mockProviders[0],
    mockProviders[2],
    mockProviders[4]
  ],
  recentSearches: ["Haircut", "Manicure", "Spa", "Barber"],
  paymentMethods: [
    {
      id: "pm1",
      type: "visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: "pm2",
      type: "mastercard",
      last4: "5555",
      expiryMonth: 10,
      expiryYear: 2026,
      isDefault: false
    }
  ]
};

// Provider-specific data
export const providerData = {
  profile: {
    id: "provider-1",
    name: "Test Provider",
    shopName: "Style Studio",
    category: "Hair Salon",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 4.9,
    reviewCount: 124,
    address: "123 Fashion Ave, New York, NY 10001",
    phone: "12125551234",
    about: "Professional provider with 8 years of experience specializing in modern cuts, color, and styling techniques.",
    isIndependent: true, // This provider is independent
    shopId: null,
    portfolio: [
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
      "https://images.unsplash.com/photo-1596935884413-260a972dab44?w=400",
    ],
    services: [
      { id: "s1", name: "Women's Haircut", duration: "45 minutes", price: 75 },
      { id: "s2", name: "Men's Haircut", duration: "30 minutes", price: 55 },
      { id: "s3", name: "Color & Highlights", duration: "2 hours", price: 150 },
      { id: "s4", name: "Blowout", duration: "30 minutes", price: 45 },
      { id: "s5", name: "Hair Treatment", duration: "1 hour", price: 80 },
    ]
  },
  appointments: [
    {
      id: "a1",
      clientName: "Emma Wilson",
      clientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      service: "Women's Haircut",
      status: "confirmed",
      day: "MON",
      date: "15",
      month: "SEP",
      time: "10:00 AM - 10:45 AM",
      price: 75
    },
    {
      id: "a2",
      clientName: "Michael Brown",
      clientImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      service: "Men's Haircut",
      status: "confirmed",
      day: "MON",
      date: "15",
      month: "SEP",
      time: "11:30 AM - 12:00 PM",
      price: 55
    },
    {
      id: "a3",
      clientName: "Sophia Garcia",
      clientImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      service: "Color & Highlights",
      status: "confirmed",
      day: "TUE",
      date: "16",
      month: "SEP",
      time: "2:00 PM - 4:00 PM",
      price: 150
    },
    {
      id: "a4",
      clientName: "James Johnson",
      clientImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      service: "Men's Haircut",
      status: "completed",
      day: "SAT",
      date: "13",
      month: "SEP",
      time: "3:00 PM - 3:30 PM",
      price: 55
    }
  ],
  earnings: {
    today: 130,
    thisWeek: 780,
    thisMonth: 3250,
    history: [
      { date: "Sep 13", amount: 130 },
      { date: "Sep 12", amount: 225 },
      { date: "Sep 11", amount: 150 },
      { date: "Sep 10", amount: 275 },
      { date: "Sep 9", amount: 0 },
      { date: "Sep 8", amount: 0 },
      { date: "Sep 7", amount: 0 }
    ]
  }
};

// Shop-based provider data (for testing shop-based provider functionality)
export const shopBasedProviderData = {
  profile: {
    id: "provider-2",
    name: "Shop Provider",
    shopName: "Elite Cuts Downtown",
    category: "Hair Salon",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 4.8,
    reviewCount: 89,
    address: "123 Main St, New York, NY 10001",
    phone: "12125551234",
    about: "Experienced provider working at Elite Cuts Downtown. Specializing in modern cuts and styling.",
    isIndependent: false, // This provider works at a shop
    shopId: "shop1",
  },
  appointments: [
    {
      id: "a1",
      clientName: "Emma Wilson",
      clientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      service: "Women's Haircut",
      status: "confirmed",
      day: "MON",
      date: "15",
      month: "SEP",
      time: "10:00 AM - 10:45 AM",
      price: 75
    },
  ],
  earnings: {
    today: 130,
    thisWeek: 780,
    thisMonth: 3250,
    history: [
      { date: "Sep 13", amount: 130 },
      { date: "Sep 12", amount: 225 },
    ]
  }
};

// Owner-specific data
export const ownerData = {
  shops: [
    {
      id: "shop1",
      name: "Elite Cuts Downtown",
      address: "123 Main St, New York, NY 10001",
      phone: "12125551234",
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400",
      rating: 4.8,
      reviewCount: 156,
      providers: 5,
      monthlyRevenue: 15800
    },
    {
      id: "shop2",
      name: "Elite Cuts Uptown",
      address: "456 Park Ave, New York, NY 10022",
      phone: "12125555678",
      image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400",
      rating: 4.7,
      reviewCount: 124,
      providers: 4,
      monthlyRevenue: 12400
    }
  ],
  team: [
    {
      id: "team1",
      name: "Jessica Miller",
      role: "Senior Provider",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      shopId: "shop1",
      rating: 4.9,
      appointmentsToday: 6,
      monthlyRevenue: 4200
    },
    {
      id: "team2",
      name: "Robert Chen",
      role: "Barber",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      shopId: "shop1",
      rating: 4.8,
      appointmentsToday: 8,
      monthlyRevenue: 3800
    },
    {
      id: "team3",
      name: "Amanda Lopez",
      role: "Colorist",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
      shopId: "shop1",
      rating: 4.9,
      appointmentsToday: 4,
      monthlyRevenue: 5100
    },
    {
      id: "team4",
      name: "David Wilson",
      role: "Junior Provider",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      shopId: "shop2",
      rating: 4.6,
      appointmentsToday: 5,
      monthlyRevenue: 2800
    }
  ],
  analytics: {
    totalRevenue: 28200,
    totalAppointments: 312,
    averageRating: 4.8,
    topServices: [
      { name: "Women's Haircut", count: 86, revenue: 6450 },
      { name: "Color & Highlights", count: 42, revenue: 6300 },
      { name: "Men's Haircut", count: 78, revenue: 4290 },
      { name: "Blowout", count: 56, revenue: 2520 }
    ],
    revenueByShop: [
      { name: "Downtown", revenue: 15800 },
      { name: "Uptown", revenue: 12400 }
    ]
  }
};