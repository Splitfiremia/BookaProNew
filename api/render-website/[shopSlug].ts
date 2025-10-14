// API Route: /api/render-website/[shopSlug]
// Generates static HTML for shop websites based on their subdomain slug

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { ShopWebsite, WebsiteTemplateId } from '@/models/shopWebsite';
import { Shop, Provider, Service, Review } from '@/models/database';

interface WebsiteRenderData {
  website: ShopWebsite;
  shop: Shop;
  providers: Provider[];
  services: Service[];
  reviews: Review[];
  analytics: {
    pageViews: number;
    rating: number;
    reviewCount: number;
  };
}

interface TemplateVariables {
  [key: string]: string | number | boolean | object;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shopSlug } = req.query;

  if (!shopSlug || typeof shopSlug !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Shop slug is required' 
    });
  }

  try {
    // Fetch website data by slug
    const websiteData = await fetchWebsiteBySlug(shopSlug);
    
    if (!websiteData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Website not found or not published' 
      });
    }

    // Track page view
    await trackPageView(websiteData.website.id, req);

    // Generate HTML from template
    const html = await generateWebsiteHTML(websiteData);

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // 1 hour browser, 24 hours CDN
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error rendering website:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Fetch website data by subdomain slug
 */
async function fetchWebsiteBySlug(slug: string): Promise<WebsiteRenderData | null> {
  // This would be replaced with actual database queries
  // For now, using mock data
  
  // Mock data - replace with actual database queries
  const mockWebsiteData: WebsiteRenderData = {
    website: {
      id: '1',
      shopId: '1',
      subdomainSlug: slug,
      templateId: 'modern',
      primaryColor: '#2563eb',
      siteTitle: 'Demo Barbershop',
      heroImageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
      businessBio: 'Professional barbershop services with over 10 years of experience. We specialize in classic cuts, modern styles, and premium grooming services.',
      tagline: 'Where Style Meets Tradition',
      showTeamSection: true,
      showPortfolioSection: true,
      showReviewsSection: true,
      showServicesSection: true,
      showContactSection: true,
      enableOnlineBooking: true,
      socialLinks: {
        instagram: 'https://instagram.com/demobarbershop',
        facebook: 'https://facebook.com/demobarbershop'
      },
      status: 'published',
      isPublished: true,
      pageViews: 1250,
      uniqueVisitors: 890,
      bookingClicks: 156,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      createdBy: '1'
    },
    shop: {
      id: '1',
      name: 'Demo Barbershop',
      description: 'Professional barbershop services',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@demobarbershop.com',
      website: 'https://demobarbershop.com',
      hours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '8:00 AM - 6:00 PM',
        sunday: 'Closed'
      },
      rating: 4.8,
      reviewCount: 127,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    } as Shop,
    providers: [
      {
        id: '1',
        name: 'Mike Johnson',
        bio: 'Master barber with 15 years of experience',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
        specialties: ['Classic Cuts', 'Beard Styling', 'Hot Towel Shaves'],
        rating: 4.9,
        reviewCount: 89
      },
      {
        id: '2',
        name: 'Sarah Davis',
        bio: 'Specialist in modern cuts and styling',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
        specialties: ['Modern Styles', 'Hair Coloring', 'Styling'],
        rating: 4.7,
        reviewCount: 67
      }
    ] as Provider[],
    services: [
      {
        id: '1',
        name: 'Classic Haircut',
        description: 'Traditional barbershop haircut with styling',
        price: 35,
        duration: 45,
        category: 'Haircuts'
      },
      {
        id: '2',
        name: 'Beard Trim & Style',
        description: 'Professional beard trimming and styling',
        price: 25,
        duration: 30,
        category: 'Grooming'
      },
      {
        id: '3',
        name: 'Hot Towel Shave',
        description: 'Luxury hot towel shave experience',
        price: 45,
        duration: 60,
        category: 'Shaving'
      }
    ] as Service[],
    reviews: [
      {
        id: '1',
        clientName: 'John Smith',
        rating: 5,
        comment: 'Excellent service! Mike gave me the best haircut I\'ve had in years.',
        date: '2024-01-10T00:00:00Z'
      },
      {
        id: '2',
        clientName: 'David Wilson',
        rating: 5,
        comment: 'Great atmosphere and professional service. Highly recommend!',
        date: '2024-01-08T00:00:00Z'
      },
      {
        id: '3',
        clientName: 'Robert Brown',
        rating: 4,
        comment: 'Good haircut, friendly staff. Will definitely come back.',
        date: '2024-01-05T00:00:00Z'
      }
    ] as Review[],
    analytics: {
      pageViews: 1250,
      rating: 4.8,
      reviewCount: 127
    }
  };

  // Return mock data if slug matches
  if (slug === 'demoshop') {
    return mockWebsiteData;
  }

  return null;
}

/**
 * Generate HTML from template and data
 */
async function generateWebsiteHTML(data: WebsiteRenderData): Promise<string> {
  const { website, shop, providers, services, reviews } = data;
  
  // Load template file
  const templatePath = path.join(process.cwd(), 'templates', `${website.templateId}-template.html`);
  
  let templateContent: string;
  try {
    templateContent = fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Template not found, using default:', error);
    templateContent = await getDefaultTemplate();
  }

  // Prepare template variables
  const variables: TemplateVariables = {
    // Basic Info
    shopName: shop.name,
    siteTitle: website.siteTitle || shop.name,
    tagline: website.tagline || '',
    businessBio: website.businessBio,
    
    // Images
    heroImageUrl: website.heroImageUrl || shop.imageUrl || '',
    logoUrl: website.logoUrl || '',
    
    // Contact Info
    address: shop.address || '',
    phone: shop.phone || '',
    email: shop.email || '',
    
    // Colors & Styling
    primaryColor: website.primaryColor,
    secondaryColor: website.secondaryColor || '#64748b',
    
    // Social Links
    instagramUrl: website.socialLinks.instagram || '',
    facebookUrl: website.socialLinks.facebook || '',
    tiktokUrl: website.socialLinks.tiktok || '',
    twitterUrl: website.socialLinks.twitter || '',
    
    // Deep Link
    bookNowUrl: generateDeepLink(website.subdomainSlug),
    webFallbackUrl: `https://bookerpro.com/shop/${website.subdomainSlug}`,
    
    // Analytics
    rating: shop.rating || 0,
    reviewCount: shop.reviewCount || 0,
    
    // Dynamic Content
    servicesHtml: generateServicesHTML(services, website),
    providersHtml: generateProvidersHTML(providers, website),
    reviewsHtml: generateReviewsHTML(reviews, website),
    hoursHtml: generateHoursHTML(shop.hours),
    
    // Meta Tags
    metaDescription: website.metaDescription || `${shop.name} - Professional services. Book online now!`,
    metaKeywords: website.metaKeywords?.join(', ') || '',
    
    // Schema.org JSON-LD
    schemaJson: generateSchemaMarkup(data)
  };

  // Replace template variables
  let html = templateContent;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(placeholder, String(value));
  });

  return html;
}

/**
 * Generate services HTML section
 */
function generateServicesHTML(services: Service[], website: ShopWebsite): string {
  if (!website.showServicesSection || services.length === 0) {
    return '';
  }

  const servicesHtml = services.map(service => `
    <div class="service-card">
      <h3>${service.name}</h3>
      <p class="service-description">${service.description}</p>
      <div class="service-details">
        <span class="price">$${service.price}</span>
        <span class="duration">${service.duration} min</span>
      </div>
    </div>
  `).join('');

  return `
    <section class="services-section">
      <div class="container">
        <h2>Our Services</h2>
        <div class="services-grid">
          ${servicesHtml}
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate providers/team HTML section
 */
function generateProvidersHTML(providers: Provider[], website: ShopWebsite): string {
  if (!website.showTeamSection || providers.length === 0) {
    return '';
  }

  const providersHtml = providers.map(provider => `
    <div class="provider-card">
      <img src="${provider.imageUrl}" alt="${provider.name}" class="provider-image">
      <h3>${provider.name}</h3>
      <p class="provider-bio">${provider.bio}</p>
      <div class="provider-rating">
        <span class="rating">★ ${provider.rating}</span>
        <span class="review-count">(${provider.reviewCount} reviews)</span>
      </div>
      <div class="specialties">
        ${provider.specialties?.map(specialty => `<span class="specialty-tag">${specialty}</span>`).join('') || ''}
      </div>
    </div>
  `).join('');

  return `
    <section class="team-section">
      <div class="container">
        <h2>Meet Our Team</h2>
        <div class="providers-grid">
          ${providersHtml}
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate reviews HTML section
 */
function generateReviewsHTML(reviews: Review[], website: ShopWebsite): string {
  if (!website.showReviewsSection || reviews.length === 0) {
    return '';
  }

  const reviewsHtml = reviews.slice(0, 6).map(review => `
    <div class="review-card">
      <div class="review-rating">
        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
      </div>
      <p class="review-comment">"${review.comment}"</p>
      <div class="review-author">- ${review.clientName}</div>
    </div>
  `).join('');

  return `
    <section class="reviews-section">
      <div class="container">
        <h2>What Our Clients Say</h2>
        <div class="reviews-grid">
          ${reviewsHtml}
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate hours HTML section
 */
function generateHoursHTML(hours: any): string {
  if (!hours) return '';

  const hoursHtml = Object.entries(hours).map(([day, time]) => `
    <div class="hours-row">
      <span class="day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
      <span class="time">${time}</span>
    </div>
  `).join('');

  return `
    <div class="hours-list">
      ${hoursHtml}
    </div>
  `;
}

/**
 * Generate Schema.org JSON-LD markup for SEO
 */
function generateSchemaMarkup(data: WebsiteRenderData): string {
  const { website, shop, services } = data;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": shop.name,
    "description": website.businessBio,
    "url": `https://bookerpro.com/${website.subdomainSlug}`,
    "telephone": shop.phone,
    "email": shop.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": shop.address
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": shop.rating,
      "reviewCount": shop.reviewCount
    },
    "openingHours": Object.entries(shop.hours || {}).map(([day, hours]) => 
      `${day.substring(0, 2).toUpperCase()} ${hours}`
    ),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services",
      "itemListElement": services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description
        },
        "price": service.price,
        "priceCurrency": "USD"
      }))
    }
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate deep link URL for mobile app
 */
function generateDeepLink(shopSlug: string): string {
  return `bookerpro://shop/${shopSlug}`;
}

/**
 * Track page view for analytics
 */
async function trackPageView(websiteId: string, req: NextApiRequest): Promise<void> {
  try {
    // This would be replaced with actual analytics tracking
    console.log(`Page view tracked for website ${websiteId}`, {
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, you would:
    // 1. Update the page view count in the database
    // 2. Track detailed analytics (device, location, referrer, etc.)
    // 3. Send data to analytics services (Google Analytics, etc.)
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Default template fallback
 */
async function getDefaultTemplate(): Promise<string> {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <meta name="description" content="{{metaDescription}}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: {{primaryColor}}; color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin: 0; }
        .hero p { font-size: 1.2rem; margin: 20px 0; }
        .cta-button { 
            display: inline-block; 
            background: white; 
            color: {{primaryColor}}; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin-top: 20px;
        }
        .section { padding: 80px 0; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>{{shopName}}</h1>
            <p>{{tagline}}</p>
            <p>{{businessBio}}</p>
            <a href="{{bookNowUrl}}" class="cta-button">Book Now</a>
        </div>
    </section>
    
    {{servicesHtml}}
    {{providersHtml}}
    {{reviewsHtml}}
    
    <section class="section">
        <div class="container text-center">
            <h2>Contact Us</h2>
            <p>{{address}}</p>
            <p>{{phone}}</p>
            <p>{{email}}</p>
        </div>
    </section>
    
    <script type="application/ld+json">
    {{schemaJson}}
    </script>
</body>
</html>
  `;
}