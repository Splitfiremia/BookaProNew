// Server Configuration for Website Builder Subdomain Routing
// This file configures how the server handles subdomain routing for shop websites

import { WebsiteRouter, RouteHandlerResult } from '@/models/websiteRouting';
import { NextRequest, NextResponse } from 'next/server';

// Configuration for different deployment environments
export const ROUTING_CONFIG = {
  development: {
    domain: 'localhost:3000',
    protocol: 'http',
    cdnUrl: undefined
  },
  staging: {
    domain: 'staging.bookerpro.com',
    protocol: 'https',
    cdnUrl: 'https://cdn-staging.bookerpro.com'
  },
  production: {
    domain: 'bookerpro.com',
    protocol: 'https',
    cdnUrl: 'https://cdn.bookerpro.com'
  }
};

// Initialize router with environment-specific config
const environment = process.env.NODE_ENV === 'production' ? 'production' : 
                   process.env.NODE_ENV === 'staging' ? 'staging' : 'development';

const router = new WebsiteRouter(ROUTING_CONFIG[environment]);

/**
 * Main middleware function for handling all incoming requests
 * This runs on every request to determine routing behavior
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  console.log(`[Routing] ${request.method} ${hostname}${pathname}`);

  try {
    // Handle the request through our router
    const result = await router.handleRequest({
      hostname,
      pathname,
      userAgent,
      headers: Object.fromEntries(request.headers.entries())
    });

    return await handleRouteResult(result, request);

  } catch (error) {
    console.error('[Routing] Error handling request:', error);
    return NextResponse.next();
  }
}

/**
 * Handle the result from the router and return appropriate response
 */
async function handleRouteResult(
  result: RouteHandlerResult, 
  request: NextRequest
): Promise<NextResponse> {
  
  switch (result.type) {
    case 'main_app':
      // Let the request continue to the main app
      return NextResponse.next();

    case 'website':
      // Serve the shop website
      return await serveShopWebsite(result, request);

    case 'mobile_redirect':
      // Redirect mobile users to the app
      return handleMobileRedirect(result, request);

    case 'not_found':
      // Show 404 page for invalid slugs
      return await serve404Page(result, request);

    case 'reserved':
      // Reserved paths go to main app
      return NextResponse.next();

    case 'unpublished':
      // Unpublished websites show 404
      return await serve404Page(result, request);

    default:
      return NextResponse.next();
  }
}

/**
 * Serve a shop website by rewriting to the render API
 */
async function serveShopWebsite(
  result: Extract<RouteHandlerResult, { type: 'website' }>,
  request: NextRequest
): Promise<NextResponse> {
  
  // Rewrite the request to our render API
  const renderUrl = new URL(`/api/render-website/${result.slug}`, request.url);
  
  // Add query parameters if needed
  renderUrl.searchParams.set('shopId', result.shopId);
  renderUrl.searchParams.set('websiteId', result.websiteId);
  
  console.log(`[Routing] Serving website: ${result.slug} -> ${renderUrl.pathname}`);
  
  return NextResponse.rewrite(renderUrl);
}

/**
 * Handle mobile app redirect with smart app detection
 */
function handleMobileRedirect(
  result: Extract<RouteHandlerResult, { type: 'mobile_redirect' }>,
  request: NextRequest
): NextResponse {
  
  // Create a response that attempts to open the app
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Opening BookerPro App...</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                background: #f5f5f5;
                text-align: center;
            }
            .container { 
                background: white; 
                padding: 40px; 
                border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                max-width: 400px;
            }
            .spinner { 
                border: 3px solid #f3f3f3; 
                border-top: 3px solid #007AFF; 
                border-radius: 50%; 
                width: 40px; 
                height: 40px; 
                animation: spin 1s linear infinite; 
                margin: 0 auto 20px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .fallback-btn {
                background: #007AFF;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="spinner"></div>
            <h2>Opening BookerPro App...</h2>
            <p>If the app doesn't open automatically:</p>
            <button class="fallback-btn" onclick="window.location.href='${result.fallbackUrl}'">
                Continue in Browser
            </button>
        </div>
        <script>
            // Attempt to open the app
            window.location.href = '${result.deepLink}';
            
            // Fallback to web version after 3 seconds
            setTimeout(function() {
                window.location.href = '${result.fallbackUrl}';
            }, 3000);
        </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

/**
 * Serve a 404 page for invalid or unpublished websites
 */
async function serve404Page(
  result: Extract<RouteHandlerResult, { type: 'not_found' | 'unpublished' }>,
  request: NextRequest
): Promise<NextResponse> {
  
  const isUnpublished = result.type === 'unpublished';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isUnpublished ? 'Website Not Available' : 'Page Not Found'}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                background: #f5f5f5;
                text-align: center;
            }
            .container { 
                background: white; 
                padding: 60px 40px; 
                border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                max-width: 500px;
            }
            h1 { 
                font-size: 4rem; 
                margin: 0 0 20px 0; 
                color: #666;
                font-weight: 300;
            }
            h2 { 
                margin: 0 0 20px 0; 
                color: #333;
                font-weight: 500;
            }
            p { 
                color: #666; 
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .btn {
                background: #007AFF;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                display: inline-block;
                transition: background 0.2s ease;
            }
            .btn:hover {
                background: #0056CC;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404</h1>
            <h2>${isUnpublished ? 'Website Not Available' : 'Page Not Found'}</h2>
            <p>
                ${isUnpublished 
                  ? 'This website is currently not available. It may be under construction or temporarily disabled.'
                  : `The page you're looking for doesn't exist. The website "${result.slug}" could not be found.`
                }
            </p>
            <a href="https://bookerpro.com" class="btn">Go to BookerPro</a>
        </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300' // Cache 404s for 5 minutes
    }
  });
}

/**
 * Configuration for which paths should be handled by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

/**
 * Utility function to clear router cache (useful for development)
 */
export function clearRouterCache(slug?: string) {
  router.clearCache(slug);
}

/**
 * Health check endpoint for monitoring
 */
export async function healthCheck() {
  try {
    // Test router functionality
    const testResult = await router.handleRequest({
      hostname: 'test.bookerpro.com',
      pathname: '/health',
      userAgent: 'HealthCheck/1.0',
      headers: {}
    });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment,
      config: ROUTING_CONFIG[environment],
      routerStatus: testResult ? 'operational' : 'degraded'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export router instance for use in other parts of the application
export { router };

/**
 * Development utilities
 */
if (process.env.NODE_ENV === 'development') {
  // Add development-specific logging
  console.log('[Routing] Development mode enabled');
  console.log('[Routing] Config:', ROUTING_CONFIG[environment]);
  
  // Expose router globally for debugging
  (global as any).__websiteRouter = router;
}