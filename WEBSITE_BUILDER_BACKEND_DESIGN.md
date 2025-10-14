# Shop Website Builder - Backend Foundation Design

## **PHASE 1: DATABASE & CORE LOGIC**

This document outlines the complete backend foundation for the custom website builder feature that will allow Shop Owners to create static websites with "Book Now" buttons that deep link into the main app.

---

## **1. DATABASE SCHEMA DESIGN**

### **Core Tables**

#### **ShopWebsite Table**
```sql
CREATE TABLE shop_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Domain & Routing
  subdomain_slug VARCHAR(50) UNIQUE NOT NULL,
  custom_domain VARCHAR(255), -- Future feature
  
  -- Template & Design
  template_id VARCHAR(20) NOT NULL DEFAULT 'modern',
  primary_color VARCHAR(7) NOT NULL DEFAULT '#2563eb',
  secondary_color VARCHAR(7),
  font_family VARCHAR(20) DEFAULT 'inter',
  
  -- Content
  site_title VARCHAR(100) NOT NULL,
  hero_image_url TEXT,
  logo_url TEXT,
  business_bio TEXT NOT NULL,
  tagline VARCHAR(150),
  
  -- SEO & Meta
  meta_description VARCHAR(160),
  meta_keywords TEXT[], -- Array of keywords
  
  -- Features & Settings
  show_team_section BOOLEAN DEFAULT true,
  show_portfolio_section BOOLEAN DEFAULT true,
  show_reviews_section BOOLEAN DEFAULT true,
  show_services_section BOOLEAN DEFAULT true,
  show_contact_section BOOLEAN DEFAULT true,
  enable_online_booking BOOLEAN DEFAULT true,
  
  -- Social Media Links
  social_links JSONB DEFAULT '{}',
  
  -- Analytics & Tracking
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  
  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  last_published_at TIMESTAMP,
  
  -- Performance & SEO
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  booking_clicks INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_slug CHECK (subdomain_slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_template CHECK (template_id IN ('modern', 'classic', 'minimal', 'luxury', 'creative'))
);

-- Indexes for performance
CREATE INDEX idx_shop_websites_slug ON shop_websites(subdomain_slug);
CREATE INDEX idx_shop_websites_shop_id ON shop_websites(shop_id);
CREATE INDEX idx_shop_websites_published ON shop_websites(is_published, status);
```

#### **WebsiteAnalytics Table**
```sql
CREATE TABLE website_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES shop_websites(id) ON DELETE CASCADE,
  
  -- Traffic Metrics
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0, -- seconds
  
  -- Conversion Metrics
  booking_clicks INTEGER DEFAULT 0,
  booking_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Traffic Sources
  traffic_sources JSONB DEFAULT '{}',
  
  -- Device Breakdown
  device_types JSONB DEFAULT '{}',
  
  -- Geographic Data
  top_countries JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(website_id, date)
);

CREATE INDEX idx_website_analytics_website_date ON website_analytics(website_id, date);
```

#### **CustomDomains Table** (Future Feature)
```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES shop_websites(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  
  -- DNS Configuration
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255) NOT NULL,
  ssl_enabled BOOLEAN DEFAULT false,
  ssl_certificate_status VARCHAR(20) DEFAULT 'pending',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'suspended')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Relationship to Existing Tables**

The new `ShopWebsite` table extends the existing `Shop` model:

```typescript
// Extended Shop interface (conceptual)
interface ShopWithWebsite extends Shop {
  website?: ShopWebsite; // Optional website configuration
}
```

**Key Relationships:**
- `shop_websites.shop_id` → `shops.id` (One-to-One)
- `shop_websites.created_by` → `users.id` (Many-to-One)
- `website_analytics.website_id` → `shop_websites.id` (One-to-Many)

---

## **2. SUBDOMAIN ROUTING LOGIC**

### **Request Flow**

```
1. User visits: https://bookerpro.com/demoshop
2. Server extracts slug: "demoshop"
3. Check if slug is reserved (api, admin, etc.)
4. Query database: SELECT * FROM shop_websites WHERE subdomain_slug = 'demoshop'
5. If found and published → Serve website
6. If not found → Serve 404
7. If mobile user with app → Redirect to deep link
```

### **Routing Middleware Logic**

```typescript
class WebsiteRouter {
  async handleRequest(request: {
    hostname: string;
    pathname: string;
    userAgent?: string;
    headers: Record<string, string>;
  }): Promise<RouteHandlerResult> {
    
    const slug = this.extractSlugFromPath(request.pathname);
    
    if (!slug) return { type: 'main_app' };
    if (this.isReservedPath(slug)) return { type: 'reserved' };
    
    const resolution = await this.resolveSlug(slug);
    if (!resolution.isValid) return { type: 'not_found', slug };
    
    const website = await this.getWebsiteData(resolution.websiteId);
    if (!website?.website.isPublished) return { type: 'unpublished', slug };
    
    if (this.shouldRedirectToMobileApp(request.userAgent, request.headers)) {
      return {
        type: 'mobile_redirect',
        deepLink: this.generateDeepLink(slug),
        fallbackUrl: `https://bookerpro.com/${slug}`
      };
    }
    
    return { type: 'website', website };
  }
}
```

### **Caching Strategy**

- **Route Resolution Cache**: 5 minutes TTL, 10k entries max
- **Database Query Cache**: 10 minutes TTL, invalidate on updates
- **CDN Cache**: 24 hours TTL, purge on website updates

---

## **3. TEMPLATE SYSTEM**

### **Pre-defined Templates**

1. **Modern**: Clean, contemporary design with bold typography
2. **Classic**: Timeless design with elegant typography
3. **Minimal**: Ultra-clean design with maximum white space
4. **Luxury**: Premium design with sophisticated colors
5. **Creative**: Bold, artistic design with unique layouts

### **Template Features**

Each template supports configurable sections:
- Hero Section (with background image/video)
- About Section (business bio)
- Services Grid (with pricing)
- Team Section (provider profiles)
- Portfolio Gallery (before/after photos)
- Reviews Carousel (customer testimonials)
- Contact Section (address, hours, social links)
- Booking CTA (prominent "Book Now" button)

### **Template Storage**

Templates are stored as React components with:
- **Layout Configuration**: Which sections to show/hide
- **Styling Variables**: Colors, fonts, spacing
- **Responsive Breakpoints**: Mobile, tablet, desktop
- **Animation Presets**: Scroll animations, hover effects

---

## **4. DEEP LINK CONFIGURATION**

### **URL Scheme Design**

```
Basic Format: bookerpro://shop/:shopSlug
```

**Examples:**
```
bookerpro://shop/demoshop
bookerpro://shop/demoshop?action=book
bookerpro://shop/demoshop?action=book&providerId=123
bookerpro://shop/demoshop?action=book&serviceId=456&date=2024-03-15&time=14:00
```

### **Deep Link Actions**

- `view`: Default shop view
- `book`: Open booking flow
- `contact`: Show contact information
- `services`: Browse services
- `portfolio`: View portfolio gallery
- `reviews`: Read customer reviews

### **Mobile App Integration**

**React Native Linking Configuration:**
```typescript
const linking = {
  prefixes: ['bookerpro://', 'https://bookerpro.com/app'],
  config: {
    screens: {
      ShopView: 'shop/:shopSlug',
      BookingFlow: 'shop/:shopSlug/book',
      ProviderProfile: 'shop/:shopSlug/provider/:providerId'
    }
  }
};
```

### **Fallback Strategy**

1. **Mobile with App**: Direct deep link
2. **Mobile without App**: App Store redirect
3. **Desktop**: Web version of the shop page
4. **Universal Links**: iOS/Android app links for seamless experience

---

## **5. API ENDPOINT STRUCTURE**

### **Website Management**

```
GET    /api/shops/:shopId/website           # Get website config
POST   /api/shops/:shopId/website           # Create website
PUT    /api/shops/:shopId/website           # Update website
DELETE /api/shops/:shopId/website           # Delete website
POST   /api/shops/:shopId/website/publish   # Publish website
POST   /api/shops/:shopId/website/unpublish # Unpublish website
```

### **Subdomain & Routing**

```
GET /api/website/check-slug/:slug           # Check slug availability
GET /api/website/resolve/:slug              # Resolve slug to website data
```

### **Templates**

```
GET /api/website/templates                  # Get all templates
GET /api/website/templates/:templateId      # Get specific template
GET /api/website/templates/:templateId/preview # Get template preview
```

### **Analytics**

```
GET  /api/shops/:shopId/website/analytics   # Get analytics data
POST /api/website/:slug/track               # Track events
```

### **Deep Linking**

```
GET /api/website/:slug/deep-link            # Generate deep link
```

---

## **6. SECURITY & VALIDATION**

### **Slug Validation Rules**

- **Format**: Only lowercase letters, numbers, and hyphens
- **Length**: 3-50 characters
- **Reserved**: Cannot use system paths (api, admin, www, etc.)
- **Uniqueness**: Must be unique across all websites

### **Content Validation**

- **Site Title**: 1-100 characters
- **Business Bio**: 10-1000 characters
- **Tagline**: Max 150 characters
- **Meta Description**: Max 160 characters
- **Colors**: Valid hex format (#RRGGBB)
- **URLs**: Valid URL format for images and links

### **Rate Limiting**

- **Website Creation**: 5 per hour per shop
- **Slug Checks**: 100 per hour per IP
- **Analytics Tracking**: 1000 per hour per website

---

## **7. PERFORMANCE CONSIDERATIONS**

### **Database Optimization**

- **Indexes**: On slug, shop_id, published status
- **Partitioning**: Analytics table by date
- **Connection Pooling**: Separate pools for read/write operations

### **Caching Layers**

1. **Application Cache**: Route resolutions, template data
2. **Database Cache**: Query results, website configurations
3. **CDN Cache**: Static website content, images
4. **Browser Cache**: CSS, JS, images with proper headers

### **Monitoring**

- **Route Resolution Time**: Target <50ms
- **Database Query Time**: Target <100ms
- **Cache Hit Rate**: Target >90%
- **Website Load Time**: Target <2s

---

## **8. DEPLOYMENT ARCHITECTURE**

### **Infrastructure Components**

1. **Web Server**: Handle routing and serve websites
2. **Database**: PostgreSQL with read replicas
3. **Cache Layer**: Redis for application cache
4. **CDN**: CloudFlare for static content delivery
5. **Analytics Service**: Real-time event processing
6. **Background Jobs**: Website publishing, analytics aggregation

### **Scaling Strategy**

- **Horizontal Scaling**: Multiple web server instances
- **Database Scaling**: Read replicas for analytics queries
- **Cache Scaling**: Redis cluster for high availability
- **CDN Scaling**: Global edge locations for fast delivery

---

## **9. ANALYTICS & INSIGHTS**

### **Tracked Metrics**

- **Traffic**: Page views, unique visitors, bounce rate
- **Engagement**: Session duration, pages per session
- **Conversions**: Booking clicks, actual bookings
- **Sources**: Direct, organic, social, referral traffic
- **Devices**: Mobile, desktop, tablet breakdown
- **Geography**: Top countries and cities

### **Reporting Dashboard**

Shop owners will see:
- **Real-time Stats**: Current visitors, today's views
- **Trend Charts**: Traffic over time, conversion rates
- **Top Content**: Most viewed sections, popular services
- **Conversion Funnel**: Website view → booking click → actual booking

---

## **10. FUTURE ENHANCEMENTS**

### **Phase 2 Features**

- **Custom Domains**: Allow shops to use their own domains
- **Advanced Templates**: More design options and customization
- **A/B Testing**: Test different versions of websites
- **SEO Tools**: Meta tag optimization, sitemap generation
- **Social Integration**: Instagram feed, Facebook reviews

### **Phase 3 Features**

- **E-commerce**: Sell products directly from website
- **Appointment Scheduling**: Book directly on website (not just app)
- **Live Chat**: Customer support integration
- **Multi-language**: Support for multiple languages
- **White Label**: Custom branding for enterprise clients

---

This comprehensive backend foundation provides a solid base for building the custom website builder feature. The design prioritizes performance, scalability, and user experience while maintaining clean separation of concerns and following best practices for web application architecture.