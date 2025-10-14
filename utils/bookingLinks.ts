// TheCut-style direct booking links
export interface BookingLinkParams {
  providerId: string;
  serviceId?: string;
  shopId?: string;
}

export const generateBookingLink = (params: BookingLinkParams): string => {
  const baseUrl = 'bookerpro://book';
  const queryParams = new URLSearchParams();
  
  queryParams.append('provider', params.providerId);
  if (params.serviceId) queryParams.append('service', params.serviceId);
  if (params.shopId) queryParams.append('shop', params.shopId);
  
  return `${baseUrl}?${queryParams.toString()}`;
};

export const generateWebBookingLink = (params: BookingLinkParams): string => {
  const baseUrl = window?.location?.origin || 'https://bookerpro.app';
  const queryParams = new URLSearchParams();
  
  queryParams.append('provider', params.providerId);
  if (params.serviceId) queryParams.append('service', params.serviceId);
  if (params.shopId) queryParams.append('shop', params.shopId);
  
  return `${baseUrl}/book?${queryParams.toString()}`;
};

export const parseBookingLink = (url: string): BookingLinkParams | null => {
  try {
    const urlObj = new URL(url);
    const providerId = urlObj.searchParams.get('provider');
    
    if (!providerId) return null;
    
    return {
      providerId,
      serviceId: urlObj.searchParams.get('service') || undefined,
      shopId: urlObj.searchParams.get('shop') || undefined,
    };
  } catch {
    return null;
  }
};

// Quick booking shortcuts
export const QUICK_BOOK_SERVICES = {
  HAIRCUT: '1',
  BEARD_TRIM: '2',
  HAIR_AND_BEARD: '3',
  HOT_TOWEL_SHAVE: '4',
} as const;

export const generateQuickBookLink = (providerId: string, serviceType: keyof typeof QUICK_BOOK_SERVICES): string => {
  return generateBookingLink({
    providerId,
    serviceId: QUICK_BOOK_SERVICES[serviceType],
  });
};