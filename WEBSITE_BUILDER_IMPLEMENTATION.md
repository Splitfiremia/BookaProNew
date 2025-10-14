# Website Builder Static Site Generation Implementation

This document outlines the complete implementation of Phase 3: Static Site Generation & Hosting for the Shop Website Builder system.

## Overview

The system generates static HTML websites from shop data and serves them on subdomains like `https://bookerpro.com/demoshop`. It includes template rendering, subdomain routing, deep linking, and analytics tracking.

## Architecture

```
Request Flow:
1. User visits bookerpro.com/demoshop
2. Middleware checks if "demoshop" is a valid shop slug
3. If valid, request is rewritten to /api/render-website/demoshop
4. API fetches shop data and renders HTML using templates
5. Generated HTML is served with caching headers
6. Analytics events are tracked
```

## Core Components

### 1. API Route: `/api/render-website/[shopSlug].ts`

**Purpose**: Generates static HTML for shop websites based on their subdomain slug.

**Key Features**:
- Fetches website data by slug from database
- Loads appropriate HTML template
- Injects dynamic data into template placeholders
- Tracks page views for analytics
- Returns fully rendered HTML with SEO metadata

**Template Variables**:
```typescript
{
  shopName: string;
  siteTitle: string;
  tagline: string;
  businessBio: string;
  heroImageUrl: string;
  logoUrl: string;
  primaryColor: string;
  bookNowUrl: string; // Deep link
  servicesHtml: string; // Generated HTML sections
  providersHtml: string;
  reviewsHtml: string;
  schemaJson: string; // SEO structured data
}
```

### 2. HTML Templates

**Location**: `/templates/`

**Available Templates**:
- `modern-template.html` - Clean, contemporary design
- `classic-template.html` - Timeless, elegant design  
- `minimal-template.html` - Ultra-clean, minimal design

**Template Features**:
- Responsive design (mobile, tablet, desktop)
- SEO optimized with meta tags and Schema.org markup
- Social media integration
- Deep linking with app detection
- Analytics tracking
- Performance optimized CSS and JavaScript

### 3. Subdomain Routing: `/middleware.ts`

**Purpose**: Handles all incoming requests and determines routing behavior.

**Routing Logic**:
```typescript
// Examples:
bookerpro.com/demoshop -> Serve shop website
bookerpro.com/api/* -> Main app API routes
bookerpro.com/admin -> Main app admin
bookerpro.com/invalidslug -> 404 page
```

**Features**:
- Slug validation and resolution
- Mobile app detection and redirection
- Caching for performance
- Error handling with custom 404 pages
- Development vs production configuration

### 4. Deep Linking System

**Deep Link Format**: `bookerpro://shop/{shopSlug}`

**Implementation**:
- "Book Now" buttons use deep links
- Fallback to web version if app not installed
- Smart app detection for mobile users
- QR code generation for easy sharing

**Example**:
```html
<a href="bookerpro://shop/demoshop" onclick="trackBookingClick()">
  Book Now
</a>
```

## Database Integration

### Required Queries

```sql
-- Find website by slug
SELECT * FROM shop_websites 
WHERE subdomain_slug = ? AND is_published = true;

-- Get full shop data for rendering
SELECT w.*, s.*, p.*, srv.*, r.*
FROM shop_websites w
JOIN shops s ON w.shop_id = s.id
LEFT JOIN providers p ON s.id = p.shop_id
LEFT JOIN services srv ON s.id = srv.shop_id
LEFT JOIN reviews r ON s.id = r.shop_id
WHERE w.subdomain_slug = ?;
```

### Analytics Tracking

```sql
-- Track page view
INSERT INTO website_analytics 
(website_id, event_type, metadata, timestamp)
VALUES (?, 'page_view', ?, NOW());

-- Track booking click
INSERT INTO website_analytics 
(website_id, event_type, metadata, timestamp)
VALUES (?, 'booking_click', ?, NOW());
```

## Deployment Configuration

### Vercel Setup

The `vercel.json` file configures:
- API route handling
- Static file serving for templates
- Subdomain routing rules
- Caching headers
- Security headers

### DNS Configuration

For subdomain routing to work:
1. Set up wildcard DNS: `*.bookerpro.com` → Vercel
2. Configure domain in Vercel project settings
3. Enable wildcard subdomain support

## Performance Optimizations

### Caching Strategy

1. **Browser Cache**: 1 hour for HTML content
2. **CDN Cache**: 24 hours for static assets
3. **Route Resolution Cache**: 5 minutes in memory
4. **Database Query Cache**: 10 minutes for shop data

### Template Optimization

- Minified CSS and JavaScript
- Optimized images with lazy loading
- Critical CSS inlined
- Non-critical resources deferred

## SEO Features

### Meta Tags
- Open Graph for social sharing
- Twitter Cards
- Structured data (Schema.org)
- Proper title and description tags

### Performance
- Fast loading times
- Mobile-first responsive design
- Accessibility compliance
- Core Web Vitals optimization

## Analytics & Tracking

### Built-in Analytics
- Page views
- Unique visitors
- Booking button clicks
- Traffic sources
- Device breakdown

### Third-party Integration
- Google Analytics support
- Facebook Pixel support
- Custom event tracking

## Security Measures

### Headers
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection

### Input Validation
- Slug format validation
- SQL injection prevention
- XSS protection in templates

## Error Handling

### 404 Pages
- Custom 404 for invalid slugs
- Different messaging for unpublished sites
- Branded error pages with navigation

### Fallbacks
- Default template if custom template fails
- Graceful degradation for missing data
- Error logging and monitoring

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Test website rendering
curl http://localhost:3000/demoshop

# Clear routing cache
curl http://localhost:3000/api/admin/clear-cache
```

### Testing
- Unit tests for template rendering
- Integration tests for routing
- Performance testing for load times
- Cross-browser compatibility testing

## Monitoring & Maintenance

### Health Checks
- API endpoint availability
- Template rendering performance
- Database connectivity
- Cache hit rates

### Logging
- Request routing decisions
- Template rendering errors
- Performance metrics
- Security events

## Future Enhancements

### Planned Features
1. Custom domain support
2. Advanced template customization
3. A/B testing for templates
4. Enhanced analytics dashboard
5. Multi-language support

### Scalability Considerations
- CDN integration for global performance
- Database read replicas for high traffic
- Template compilation and caching
- Microservice architecture for large scale

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/render-website/[slug]` | GET | Render shop website |
| `/api/website/[slug]/track` | POST | Track analytics events |
| `/api/website/check-slug/[slug]` | GET | Check slug availability |
| `/api/admin/clear-cache` | POST | Clear routing cache |

## Configuration Files

- `vercel.json` - Deployment configuration
- `middleware.ts` - Routing middleware
- `models/shopWebsite.ts` - Database schema
- `models/websiteAPI.ts` - API interfaces
- `models/websiteRouting.ts` - Routing logic

## Conclusion

This implementation provides a complete static site generation system for shop websites with:
- Fast, SEO-optimized websites
- Seamless deep linking to mobile app
- Comprehensive analytics tracking
- Scalable architecture
- Professional templates
- Easy deployment and maintenance

The system is production-ready and can handle thousands of shop websites with proper caching and optimization strategies.