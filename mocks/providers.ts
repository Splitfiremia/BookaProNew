export const mockCategories = [
  "All",
  "Hair Stylists",
  "Nail Technicians", 
  "Massage Therapists",
  "Estheticians",
  "Lash Specialists",
  "Spa Services"
];

export const priceRanges = [
  { label: "All Prices", min: 0, max: 1000 },
  { label: "$ (Under $50)", min: 0, max: 50 },
  { label: "$ ($50-$100)", min: 50, max: 100 },
  { label: "$$ ($100-$200)", min: 100, max: 200 },
  { label: "$$ ($200+)", min: 200, max: 1000 }
];

export const distanceRanges = [
  { label: "All Distances", value: 50 },
  { label: "Within 1 mile", value: 1 },
  { label: "Within 3 miles", value: 3 },
  { label: "Within 5 miles", value: 5 },
  { label: "Within 10 miles", value: 10 }
];

export const availabilityOptions = [
  "All Times",
  "Available Today",
  "Available This Week",
  "Available This Weekend"
];

export const sortOptions = [
  "Distance",
  "Rating", 
  "Price: Low to High",
  "Price: High to Low",
  "Most Popular"
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  bio: string;
}

export interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface PortfolioItem {
  id: string;
  image: string;
  beforeImage?: string;
  title: string;
  description: string;
  category: string;
}

export const mockProviders = [
  {
    id: "1",
    name: "Jose Santiago",
    shopName: "Free Advice Barber Shop",
    category: "Hair Stylists",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    rating: 5.0,
    reviewCount: 82,
    distance: 0.5,
    distanceText: "0.5 mi",
    startingPrice: 35,
    address: "548 East 13th Street, New York, NY 10009",
    phone: "13477212262",
    website: "www.freeadvicebarber.com",
    instagram: "@freeadvicebarber",
    about: "Master stylist with over 15 years of experience. Specializing in modern cuts, fades, and traditional techniques. Our shop has been serving the community since 2008, providing premium grooming services in a welcoming atmosphere.",
    specialties: ["Fades", "Beard Styling", "Classic Cuts"],
    availableToday: true,
    isPopular: true,
    isShopOwner: true,
    businessHours: [
      { day: "Monday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Tuesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Wednesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Thursday", hours: "9:00 AM - 8:00 PM", isOpen: true },
      { day: "Friday", hours: "9:00 AM - 8:00 PM", isOpen: true },
      { day: "Saturday", hours: "8:00 AM - 6:00 PM", isOpen: true },
      { day: "Sunday", hours: "Closed", isOpen: false }
    ],
    portfolio: [
      {
        id: "p1",
        image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400",
        beforeImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
        title: "Classic Fade Transformation",
        description: "Modern fade with textured top",
        category: "Before & After"
      },
      {
        id: "p2",
        image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400",
        title: "Precision Beard Styling",
        description: "Full beard trim and shape",
        category: "Beard Work"
      },
      {
        id: "p3",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400",
        beforeImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400",
        title: "Executive Cut",
        description: "Professional business style",
        category: "Before & After"
      },
      {
        id: "p4",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
        title: "Creative Design",
        description: "Custom hair art and patterns",
        category: "Creative Work"
      }
    ],
    teamMembers: [
      {
        id: "t1",
        name: "Marcus Johnson",
        role: "Senior Stylist",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        specialties: ["Fades", "Line-ups", "Beard Styling"],
        rating: 4.9,
        reviewCount: 45,
        bio: "5+ years experience specializing in modern cuts and classic styles."
      },
      {
        id: "t2",
        name: "Carlos Rivera",
        role: "Barber",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        specialties: ["Traditional Cuts", "Hot Towel Shaves", "Mustache Styling"],
        rating: 4.8,
        reviewCount: 32,
        bio: "Traditional barber with expertise in classic techniques and hot towel services."
      }
    ],
    services: [
      { id: "s1", name: "Haircut", duration: "30 minutes", price: 55 },
      { id: "s2", name: "Scissor Cut", duration: "30 minutes", price: 60 },
      { id: "s3", name: "Transformation", duration: "45 minutes", price: 70 },
      { id: "s4", name: "Custom Design", duration: "45 minutes", price: 70 },
      { id: "s5", name: "The BALLERZ Deluxe", duration: "1 hour", price: 100 },
      { id: "s6", name: "Kids Haircut", duration: "30 minutes", price: 35 },
      { id: "s7", name: "Shape Up", duration: "15 minutes", price: 35 },
      { id: "s8", name: "Beard Trim/Full Shave", duration: "15 minutes", price: 30 },
    ],
    reviews: [
      {
        userName: "Michael Chen",
        userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        rating: 5,
        date: "2 days ago",
        comment: "Best stylist in NYC! Jose always delivers perfect cuts. The attention to detail is incredible."
      },
      {
        userName: "David Rodriguez",
        userImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        rating: 5,
        date: "1 week ago",
        comment: "Been coming here for years. Consistent quality and great atmosphere."
      }
    ]
  },
  {
    id: "2",
    name: "Maria Lopez",
    shopName: "Glamour Beauty Salon",
    category: "Hair Stylists",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
    profileImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200",
    rating: 4.8,
    reviewCount: 156,
    distance: 1.2,
    distanceText: "1.2 mi",
    startingPrice: 45,
    address: "234 Broadway, New York, NY 10007",
    phone: "12125551234",
    about: "Expert colorist and stylist specializing in modern hair transformations.",
    specialties: ["Color", "Highlights", "Balayage"],
    availableToday: false,
    isPopular: true,
    services: [
      { id: "s1", name: "Women's Haircut", duration: "45 minutes", price: 75 },
      { id: "s2", name: "Color & Highlights", duration: "2 hours", price: 150 },
      { id: "s3", name: "Blowout", duration: "30 minutes", price: 45 },
      { id: "s4", name: "Hair Treatment", duration: "1 hour", price: 80 },
    ]
  },
  {
    id: "3",
    name: "Lily Chen",
    shopName: "Zen Nail Spa",
    category: "Nail Technicians",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
    coverImage: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800",
    profileImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200",
    rating: 4.9,
    reviewCount: 203,
    distance: 0.8,
    distanceText: "0.8 mi",
    startingPrice: 30,
    address: "456 Park Avenue, New York, NY 10016",
    phone: "12125555678",
    website: "www.zennailspa.com",
    instagram: "@zennailspa",
    about: "Licensed nail technician with expertise in nail art and gel applications. Specializing in intricate designs and premium nail care services.",
    specialties: ["Nail Art", "Gel Manicures", "Pedicures"],
    availableToday: true,
    isPopular: false,
    isShopOwner: false,
    businessHours: [
      { day: "Monday", hours: "10:00 AM - 8:00 PM", isOpen: true },
      { day: "Tuesday", hours: "10:00 AM - 8:00 PM", isOpen: true },
      { day: "Wednesday", hours: "10:00 AM - 8:00 PM", isOpen: true },
      { day: "Thursday", hours: "10:00 AM - 8:00 PM", isOpen: true },
      { day: "Friday", hours: "10:00 AM - 8:00 PM", isOpen: true },
      { day: "Saturday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Sunday", hours: "11:00 AM - 6:00 PM", isOpen: true }
    ],
    portfolio: [
      {
        id: "p1",
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
        title: "Floral Nail Art",
        description: "Hand-painted cherry blossoms",
        category: "Nail Art"
      },
      {
        id: "p2",
        image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400",
        title: "Geometric Designs",
        description: "Modern abstract patterns",
        category: "Nail Art"
      },
      {
        id: "p3",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
        title: "French Manicure",
        description: "Classic elegant finish",
        category: "Classic"
      },
      {
        id: "p4",
        image: "https://images.unsplash.com/photo-1599948128020-9a44d1f0824a?w=400",
        title: "Ombre Nails",
        description: "Gradient color blending",
        category: "Color Work"
      }
    ],
    services: [
      { id: "s1", name: "Classic Manicure", duration: "30 minutes", price: 30 },
      { id: "s2", name: "Gel Manicure", duration: "45 minutes", price: 45 },
      { id: "s3", name: "Classic Pedicure", duration: "45 minutes", price: 40 },
      { id: "s4", name: "Nail Art", duration: "1 hour", price: 60 },
    ]
  },
  {
    id: "4",
    name: "James Wilson",
    shopName: "Urban Wellness Spa",
    category: "Massage Therapists",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    profileImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200",
    rating: 4.7,
    reviewCount: 89,
    distance: 2.0,
    distanceText: "2.0 mi",
    startingPrice: 80,
    address: "789 5th Avenue, New York, NY 10022",
    phone: "12125559012",
    about: "Licensed massage therapist specializing in therapeutic and relaxation massage.",
    specialties: ["Deep Tissue", "Swedish", "Sports Massage"],
    availableToday: false,
    isPopular: false,
    services: [
      { id: "s1", name: "Swedish Massage", duration: "60 minutes", price: 120 },
      { id: "s2", name: "Deep Tissue Massage", duration: "60 minutes", price: 140 },
      { id: "s3", name: "Facial Treatment", duration: "75 minutes", price: 100 },
      { id: "s4", name: "Body Scrub", duration: "45 minutes", price: 80 },
    ]
  },
  {
    id: "5",
    name: "Sarah Johnson",
    shopName: "Brow Bar NYC",
    category: "Lash Specialists",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
    rating: 4.9,
    reviewCount: 178,
    distance: 1.5,
    distanceText: "1.5 mi",
    startingPrice: 25,
    address: "321 Madison Avenue, New York, NY 10017",
    phone: "12125553456",
    about: "Certified lash and brow specialist with expertise in extensions and shaping.",
    specialties: ["Lash Extensions", "Brow Shaping", "Lash Lifts"],
    availableToday: true,
    isPopular: true,
    services: [
      { id: "s1", name: "Eyebrow Threading", duration: "15 minutes", price: 25 },
      { id: "s2", name: "Eyebrow Tinting", duration: "20 minutes", price: 35 },
      { id: "s3", name: "Lash Lift", duration: "45 minutes", price: 75 },
      { id: "s4", name: "Lash Extensions", duration: "90 minutes", price: 150 },
    ]
  },
  {
    id: "6",
    name: "Amanda Rodriguez",
    shopName: "Glow Esthetics Studio",
    category: "Estheticians",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
    coverImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800",
    profileImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200",
    rating: 4.8,
    reviewCount: 124,
    distance: 1.8,
    distanceText: "1.8 mi",
    startingPrice: 65,
    address: "567 Lexington Avenue, New York, NY 10022",
    phone: "12125557890",
    website: "www.glowestheticsstudio.com",
    instagram: "@glowestheticsstudio",
    about: "Licensed esthetician specializing in advanced skincare treatments and anti-aging. Certified in medical-grade treatments with 8+ years of experience.",
    specialties: ["Facials", "Chemical Peels", "Microdermabrasion"],
    availableToday: true,
    isPopular: false,
    isShopOwner: false,
    businessHours: [
      { day: "Monday", hours: "9:00 AM - 6:00 PM", isOpen: true },
      { day: "Tuesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Wednesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
      { day: "Thursday", hours: "9:00 AM - 8:00 PM", isOpen: true },
      { day: "Friday", hours: "9:00 AM - 6:00 PM", isOpen: true },
      { day: "Saturday", hours: "10:00 AM - 5:00 PM", isOpen: true },
      { day: "Sunday", hours: "Closed", isOpen: false }
    ],
    portfolio: [
      {
        id: "p1",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
        beforeImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
        title: "Acne Treatment Results",
        description: "6-week treatment program",
        category: "Before & After"
      },
      {
        id: "p2",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
        title: "Hydrating Facial",
        description: "Deep moisture restoration",
        category: "Treatment"
      },
      {
        id: "p3",
        image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
        beforeImage: "https://images.unsplash.com/photo-1594824804732-5eaaea6b2b84?w=400",
        title: "Anti-Aging Treatment",
        description: "Fine line reduction",
        category: "Before & After"
      },
      {
        id: "p4",
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
        title: "Chemical Peel",
        description: "Skin texture improvement",
        category: "Treatment"
      }
    ],
    services: [
      { id: "s1", name: "Classic Facial", duration: "60 minutes", price: 85 },
      { id: "s2", name: "Anti-Aging Facial", duration: "75 minutes", price: 120 },
      { id: "s3", name: "Chemical Peel", duration: "45 minutes", price: 95 },
      { id: "s4", name: "Microdermabrasion", duration: "60 minutes", price: 110 },
    ]
  },
  {
    id: "7",
    name: "Michael Thompson",
    shopName: "Serenity Spa Services",
    category: "Spa Services",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    profileImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200",
    rating: 4.6,
    reviewCount: 67,
    distance: 3.2,
    distanceText: "3.2 mi",
    startingPrice: 90,
    address: "890 Park Avenue, New York, NY 10075",
    phone: "12125554321",
    about: "Full-service spa professional offering comprehensive wellness treatments.",
    specialties: ["Hot Stone Massage", "Aromatherapy", "Body Wraps"],
    availableToday: false,
    isPopular: false,
    services: [
      { id: "s1", name: "Hot Stone Massage", duration: "90 minutes", price: 160 },
      { id: "s2", name: "Aromatherapy Session", duration: "60 minutes", price: 130 },
      { id: "s3", name: "Body Wrap Treatment", duration: "75 minutes", price: 140 },
      { id: "s4", name: "Couples Massage", duration: "60 minutes", price: 240 },
    ]
  },
  {
    id: "8",
    name: "Jessica Kim",
    shopName: "Elite Hair Studio",
    category: "Hair Stylists",
    image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400",
    profileImage: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200",
    rating: 4.9,
    reviewCount: 245,
    distance: 0.3,
    distanceText: "0.3 mi",
    startingPrice: 55,
    address: "123 West 14th Street, New York, NY 10011",
    phone: "12125556789",
    about: "Award-winning stylist specializing in precision cuts and color correction.",
    specialties: ["Precision Cuts", "Color Correction", "Keratin Treatments"],
    availableToday: true,
    isPopular: true,
    services: [
      { id: "s1", name: "Precision Cut", duration: "45 minutes", price: 85 },
      { id: "s2", name: "Color Correction", duration: "3 hours", price: 250 },
      { id: "s3", name: "Keratin Treatment", duration: "2 hours", price: 180 },
      { id: "s4", name: "Blowout & Style", duration: "30 minutes", price: 55 },
    ]
  }
];