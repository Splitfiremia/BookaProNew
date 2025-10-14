// Mock appointments with provider IDs for payment flow
export const mockAppointments = [
  {
    id: "1",
    providerId: "provider-1",
    providerName: "Jose Santiago",
    providerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    service: "Haircut",
    status: "confirmed",
    day: "SAT",
    date: "13",
    month: "SEP",
    time: "5:00 PM - 5:30 PM",
    location: "Free Advice Barber Shop",
    price: 35
  },
  {
    id: "2",
    providerId: "provider-2",
    providerName: "Maria Lopez",
    providerImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
    service: "Color & Highlights",
    status: "pending",
    day: "MON",
    date: "15",
    month: "SEP",
    time: "2:00 PM - 4:00 PM",
    location: "Glamour Beauty Salon",
    price: 150
  },
  {
    id: "3",
    providerId: "provider-3",
    providerName: "Lily Chen",
    providerImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
    service: "Gel Manicure",
    status: "completed",
    day: "FRI",
    date: "5",
    month: "SEP",
    time: "11:00 AM - 11:45 AM",
    location: "Zen Nail Spa",
    price: 45
  },
  {
    id: "4",
    providerId: "provider-4",
    providerName: "James Wilson",
    providerImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    service: "Swedish Massage",
    status: "completed",
    day: "WED",
    date: "3",
    month: "SEP",
    time: "6:00 PM - 7:00 PM",
    location: "Urban Wellness Spa",
    price: 120
  },
  {
    id: "5",
    providerId: "provider-1",
    providerName: "Jose Santiago",
    providerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    service: "Beard Trim & Style",
    status: "completed",
    day: "THU",
    date: "11",
    month: "SEP",
    time: "3:00 PM - 3:30 PM",
    location: "Free Advice Barber Shop",
    price: 25
  },
  {
    id: "6",
    providerId: "provider-2",
    providerName: "Maria Lopez",
    providerImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
    service: "Blowout & Style",
    status: "completed",
    day: "TUE",
    date: "9",
    month: "SEP",
    time: "1:00 PM - 2:00 PM",
    location: "Glamour Beauty Salon",
    price: 65
  }
];

export const mockProviders = [
  {
    id: "provider-1",
    name: "Jose Santiago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    shopName: "Free Advice Barber Shop",
    specialties: ["Haircuts", "Beard Trims", "Hot Towel Shaves"]
  },
  {
    id: "provider-2",
    name: "Maria Lopez",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
    shopName: "Glamour Beauty Salon",
    specialties: ["Hair Color", "Highlights", "Blowouts"]
  },
  {
    id: "provider-3",
    name: "Lily Chen",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
    shopName: "Zen Nail Spa",
    specialties: ["Manicures", "Pedicures", "Nail Art"]
  },
  {
    id: "provider-4",
    name: "James Wilson",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    shopName: "Urban Wellness Spa",
    specialties: ["Massage Therapy", "Deep Tissue", "Relaxation"]
  }
];