import { ShopWebsite, WebsiteTemplate } from '@/models/shopWebsite';
import { templateCacheService, cacheService } from './CacheService';
import {
  ValidationResult,
  ValidationError,
  APIResponse,
  ExportOptions,
  ExportResult,
  PerformanceMetrics,
  OptimizationSuggestion,
} from '@/types/website';

/**
 * Abstract Template Processor using Template Method Pattern
 * Defines the skeleton of template processing algorithm with performance optimizations
 */
abstract class TemplateProcessor {
  private static readonly PROCESSING_CACHE = new Map<string, { result: string; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  
  /**
   * Template Method - defines the algorithm structure with caching
   */
  public async processTemplate(websiteData: Partial<ShopWebsite>, templateId: string): Promise<string> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(websiteData, templateId);
    
    try {
      if (__DEV__) {
        console.log(`Processing template ${templateId} with Template Method pattern`);
      }
      
      // Check cache first
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        const cacheTime = performance.now() - startTime;
        if (__DEV__) {
          console.log(`Template ${templateId} served from cache in ${cacheTime.toFixed(2)}ms`);
        }
        TemplatePerformanceMonitor.recordProcessing(templateId, cacheTime, true, false);
        return cached;
      }
      
      // Step 1: Load template with parallel data fetching
      const [template, validationResult] = await Promise.all([
        this.loadTemplate(templateId),
        this.preValidateData(websiteData)
      ]);
      
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Step 2: Validate template-specific data
      await this.validateTemplateData(websiteData, template);
      
      // Step 3: Prepare template variables with optimization
      const templateVars = await this.prepareTemplateVariables(websiteData, template);
      
      // Step 4: Process template content (abstract method)
      const processedContent = await this.processTemplateContent(template, templateVars);
      
      // Step 5: Apply optimizations in parallel
      const [optimizedContent, performanceMetrics] = await Promise.all([
        this.optimizeContent(processedContent, websiteData),
        this.collectPerformanceMetrics(processedContent)
      ]);
      
      // Step 6: Post-process (hook for subclasses)
      const finalContent = await this.postProcess(optimizedContent, websiteData, template);
      
      // Cache the result
      this.setCachedResult(cacheKey, finalContent);
      
      const processingTime = performance.now() - startTime;
      if (__DEV__) {
        console.log(`Template ${templateId} processed in ${processingTime.toFixed(2)}ms`);
      }
      
      // Log performance metrics
      this.logPerformanceMetrics(templateId, processingTime, performanceMetrics);
      TemplatePerformanceMonitor.recordProcessing(templateId, processingTime, false, false);
      
      return finalContent;
      
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error('Template processing failed:', error);
      TemplatePerformanceMonitor.recordProcessing(templateId, errorTime, false, true);
      throw error;
    }
  }
  
  /**
   * Load template with caching - can be overridden by subclasses
   */
  protected async loadTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    return await templateCacheService.getTemplate(templateId) || await WebsiteBuilderService.getTemplate(templateId);
  }
  
  /**
   * Pre-validate data for early error detection
   */
  protected async preValidateData(websiteData: Partial<ShopWebsite>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!websiteData.siteTitle?.trim()) {
      errors.push('Site title is required');
    }
    
    if (websiteData.siteTitle && websiteData.siteTitle.length > 100) {
      errors.push('Site title must be 100 characters or less');
    }
    
    if (websiteData.primaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(websiteData.primaryColor)) {
      errors.push('Primary color must be a valid hex color');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate template data - can be overridden by subclasses
   */
  protected async validateTemplateData(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<void> {
    // Default validation
    if (!websiteData.siteTitle?.trim()) {
      throw new Error('Site title is required for template processing');
    }
  }
  
  /**
   * Prepare template variables with optimization - can be overridden by subclasses
   */
  protected async prepareTemplateVariables(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<Record<string, any>> {
    // Use memoization for expensive computations
    const baseVariables = {
      ...websiteData,
      templateId: template.id,
      processedAt: new Date().toISOString(),
      bookNowUrl: websiteData.subdomainSlug ? `https://bookerpro.com/${websiteData.subdomainSlug}/book` : '#',
    };
    
    // Generate optimized HTML sections in parallel
    const [servicesHtml, providersHtml, reviewsHtml] = await Promise.all([
      this.generateServicesHtml(websiteData, template),
      this.generateProvidersHtml(websiteData, template),
      this.generateReviewsHtml(websiteData, template)
    ]);
    
    return {
      ...baseVariables,
      servicesHtml,
      providersHtml,
      reviewsHtml,
    };
  }
  
  /**
   * Generate services HTML section
   */
  protected async generateServicesHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasServicesGrid) return '';
    
    // Mock services data - in real app, this would come from the database
    const services = [
      { name: 'Haircut', price: '$30', duration: '30 min' },
      { name: 'Hair Color', price: '$80', duration: '90 min' },
      { name: 'Styling', price: '$40', duration: '45 min' },
    ];
    
    return `
      <section class="services" style="padding: 60px 20px; background: #f8f9fa;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">Our Services</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${services.map(service => `
              <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #333;">${service.name}</h3>
                <p style="font-size: 1.2rem; color: ${websiteData.primaryColor || '#007AFF'}; font-weight: 600; margin-bottom: 5px;">${service.price}</p>
                <p style="color: #666; font-size: 0.9rem;">${service.duration}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Generate providers HTML section
   */
  protected async generateProvidersHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasTeamSection) return '';
    
    // Mock providers data
    const providers = [
      { name: 'Sarah Johnson', role: 'Senior Stylist', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face' },
      { name: 'Mike Chen', role: 'Colorist', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
    ];
    
    return `
      <section class="team" style="padding: 60px 20px;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">Meet Our Team</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
            ${providers.map(provider => `
              <div style="text-align: center;">
                <img src="${provider.image}" alt="${provider.name}" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;" loading="lazy" />
                <h3 style="font-size: 1.3rem; margin-bottom: 5px; color: #333;">${provider.name}</h3>
                <p style="color: #666;">${provider.role}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Generate reviews HTML section
   */
  protected async generateReviewsHtml(websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    if (!template.features.hasReviewsCarousel) return '';
    
    // Mock reviews data
    const reviews = [
      { name: 'Emma Wilson', rating: 5, text: 'Amazing service! Sarah did an incredible job with my hair color.' },
      { name: 'David Brown', rating: 5, text: 'Professional and friendly staff. Highly recommend!' },
    ];
    
    return `
      <section class="reviews" style="padding: 60px 20px; background: #f8f9fa;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2.5rem; margin-bottom: 40px; color: ${websiteData.primaryColor || '#333'};">What Our Clients Say</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${reviews.map(review => `
              <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="color: #ffd700; font-size: 1.2rem; margin-bottom: 15px;">${'★'.repeat(review.rating)}</div>
                <p style="font-style: italic; margin-bottom: 20px; color: #555;">"${review.text}"</p>
                <p style="font-weight: 600; color: #333;">- ${review.name}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Abstract method - must be implemented by subclasses
   */
  protected abstract processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string>;
  
  /**
   * Optimize content - can be overridden by subclasses
   */
  protected async optimizeContent(content: string, websiteData: Partial<ShopWebsite>): Promise<string> {
    // Default optimization: minify HTML
    return content
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();
  }
  
  /**
   * Post-process hook - can be overridden by subclasses
   */
  protected async postProcess(content: string, websiteData: Partial<ShopWebsite>, template: WebsiteTemplate): Promise<string> {
    return content;
  }
  
  /**
   * Generate cache key for template processing
   */
  private generateCacheKey(websiteData: Partial<ShopWebsite>, templateId: string): string {
    const keyData = {
      templateId,
      siteTitle: websiteData.siteTitle,
      primaryColor: websiteData.primaryColor,
      secondaryColor: websiteData.secondaryColor,
      businessBio: websiteData.businessBio,
      showTeamSection: websiteData.showTeamSection,
      showServicesSection: websiteData.showServicesSection,
      showReviewsSection: websiteData.showReviewsSection,
    };
    
    return `template_${templateId}_${this.hashObject(keyData)}`;
  }
  
  /**
   * Simple hash function for cache keys
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): string | null {
    const cached = TemplateProcessor.PROCESSING_CACHE.get(cacheKey);
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.result;
    }
    
    if (cached) {
      TemplateProcessor.PROCESSING_CACHE.delete(cacheKey);
    }
    
    return null;
  }
  
  /**
   * Set cached result with TTL
   */
  private setCachedResult(cacheKey: string, result: string): void {
    // Implement LRU eviction if cache is full
    if (TemplateProcessor.PROCESSING_CACHE.size >= TemplateProcessor.MAX_CACHE_SIZE) {
      const firstKey = TemplateProcessor.PROCESSING_CACHE.keys().next().value;
      if (firstKey) {
        TemplateProcessor.PROCESSING_CACHE.delete(firstKey);
      }
    }
    
    TemplateProcessor.PROCESSING_CACHE.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: TemplateProcessor.CACHE_TTL
    });
  }
  
  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(content: string): Promise<{ size: number; complexity: number }> {
    return {
      size: content.length,
      complexity: (content.match(/</g) || []).length // Simple complexity metric based on HTML tags
    };
  }
  
  /**
   * Log performance metrics
   */
  private logPerformanceMetrics(templateId: string, processingTime: number, metrics: { size: number; complexity: number }): void {
    if (__DEV__) {
      console.log(`Template ${templateId} metrics:`, {
        processingTime: `${processingTime.toFixed(2)}ms`,
        contentSize: `${(metrics.size / 1024).toFixed(2)}KB`,
        complexity: metrics.complexity,
        cacheSize: TemplateProcessor.PROCESSING_CACHE.size
      });
    }
  }
  
  /**
   * Clear processing cache
   */
  public static clearProcessingCache(): void {
    TemplateProcessor.PROCESSING_CACHE.clear();
    if (__DEV__) {
      console.log('Template processing cache cleared');
    }
  }
}

/**
 * HTML Template Processor - handles HTML template processing
 */
class HTMLTemplateProcessor extends TemplateProcessor {
  protected async processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string> {
    // Load HTML template content
    const htmlContent = await this.loadHTMLContent(template.id as string);
    
    // Process Handlebars-style template
    return this.processHandlebarsTemplate(htmlContent, variables);
  }
  
  private async loadHTMLContent(templateId: string): Promise<string> {
    // In a real app, this would load from file system or CDN
    // For now, return mock HTML content based on template ID
    const templateMap: Record<string, string> = {
      'modern': await this.getModernTemplateHTML(),
      'classic': await this.getClassicTemplateHTML(),
      'creative': await this.getCreativeTemplateHTML(),
    };
    
    return templateMap[templateId] || templateMap['modern'];
  }
  
  private processHandlebarsTemplate(html: string, variables: Record<string, any>): string {
    let processedHtml = html;
    
    // Process simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value || ''));
    });
    
    // Process conditional blocks {{#if condition}}...{{/if}}
    processedHtml = this.processConditionals(processedHtml, variables);
    
    // Process loops {{#each array}}...{{/each}}
    processedHtml = this.processLoops(processedHtml, variables);
    
    return processedHtml;
  }
  
  private processConditionals(html: string, variables: Record<string, any>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return html.replace(conditionalRegex, (match, condition, content) => {
      const value = variables[condition];
      return value ? content : '';
    });
  }
  
  private processLoops(html: string, variables: Record<string, any>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return html.replace(loopRegex, (match, arrayName, template) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemHtml = template;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemHtml = itemHtml.replace(regex, String(value || ''));
        });
        return itemHtml;
      }).join('');
    });
  }
  
  private async getModernTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        .hero { background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); color: white; padding: 100px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; }
        .cta-button { background: white; color: {{primaryColor}}; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
        <a href="{{bookNowUrl}}" class="cta-button">Book Now</a>
    </section>
    {{servicesHtml}}
    {{providersHtml}}
    {{reviewsHtml}}
</body>
</html>`;
  }
  
  private async getClassicTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #f8f8f8; }
        .header { background: {{primaryColor}}; color: white; padding: 60px 20px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 15px; }
        .content { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .cta-button { background: {{primaryColor}}; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; }
    </style>
</head>
<body>
    <header class="header">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
    </header>
    <div class="content">
        {{servicesHtml}}
        {{providersHtml}}
        <a href="{{bookNowUrl}}" class="cta-button">Schedule Appointment</a>
    </div>
</body>
</html>`;
  }
  
  private async getCreativeTemplateHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteTitle}}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 0; background: #000; color: #fff; }
        .hero { background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}}); padding: 120px 20px; text-align: center; }
        .hero h1 { font-size: 4rem; margin-bottom: 20px; font-weight: 300; }
        .hero p { font-size: 1.3rem; margin-bottom: 40px; }
        .cta-button { background: transparent; color: white; border: 2px solid white; padding: 15px 30px; border-radius: 0; text-decoration: none; font-weight: 400; transition: all 0.3s; }
        .cta-button:hover { background: white; color: {{primaryColor}}; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{siteTitle}}</h1>
        <p>{{businessBio}}</p>
        <a href="{{bookNowUrl}}" class="cta-button">BOOK NOW</a>
    </section>
    {{servicesHtml}}
    {{providersHtml}}
</body>
</html>`;
  }
  
  protected async optimizeContent(content: string, websiteData: Partial<ShopWebsite>): Promise<string> {
    let optimized = await super.optimizeContent(content, websiteData);
    
    // HTML-specific optimizations
    optimized = optimized
      .replace(/\s*\n\s*/g, ' ')  // Remove line breaks and extra spaces
      .replace(/<!--[\s\S]*?-->/g, '')  // Remove HTML comments
      .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with single space
      .trim();
    
    return optimized;
  }
}

/**
 * JSON Template Processor - handles JSON-based templates
 */
class JSONTemplateProcessor extends TemplateProcessor {
  protected async processTemplateContent(template: WebsiteTemplate, variables: Record<string, any>): Promise<string> {
    // Process JSON-based template configuration
    const jsonConfig = {
      template: template.id,
      data: variables,
      features: template.features,
      colors: {
        primary: variables.primaryColor || template.defaultColors.primary,
        secondary: variables.secondaryColor || template.defaultColors.secondary,
      },
      sections: this.generateSections(variables, template),
    };
    
    return JSON.stringify(jsonConfig, null, 2);
  }
  
  private generateSections(variables: Record<string, any>, template: WebsiteTemplate): any[] {
    const sections = [];
    
    // Hero section
    sections.push({
      type: 'hero',
      title: variables.siteTitle,
      subtitle: variables.businessBio,
      backgroundImage: variables.heroImageUrl,
      ctaText: 'Book Now',
      ctaUrl: variables.bookNowUrl,
    });
    
    // Services section
    if (template.features.hasServicesGrid && variables.services) {
      sections.push({
        type: 'services',
        title: 'Our Services',
        items: variables.services,
      });
    }
    
    // Team section
    if (template.features.hasTeamSection && variables.providers) {
      sections.push({
        type: 'team',
        title: 'Meet Our Team',
        members: variables.providers,
      });
    }
    
    return sections;
  }
}

/**
 * Template Factory - creates appropriate processor based on output format
 */
class TemplateProcessorFactory {
  static createProcessor(outputFormat: 'html' | 'json' = 'html'): TemplateProcessor {
    switch (outputFormat) {
      case 'html':
        return new HTMLTemplateProcessor();
      case 'json':
        return new JSONTemplateProcessor();
      default:
        return new HTMLTemplateProcessor();
    }
  }
}

export interface WebsiteBuilderConfig {
  apiBaseUrl: string;
  cdnUrl: string;
  maxFileSize: number;
  supportedFormats: string[];
  cacheTTL: number;
}

export class WebsiteBuilderService {
  private static config: WebsiteBuilderConfig = {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.bookerpro.com',
    cdnUrl: process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.bookerpro.com',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    cacheTTL: 15 * 60 * 1000, // 15 minutes
  };

  /**
   * Process template using Template Method pattern
   */
  static async processTemplate(
    websiteData: Partial<ShopWebsite>, 
    templateId: string, 
    outputFormat: 'html' | 'json' = 'html'
  ): Promise<string> {
    const processor = TemplateProcessorFactory.createProcessor(outputFormat);
    return await processor.processTemplate(websiteData, templateId);
  }

  /**
   * Save website with caching and validation
   */
  static async saveWebsite(websiteData: Partial<ShopWebsite>): Promise<APIResponse<ShopWebsite>> {
    try {
      // Validate website data
      const validation = this.validateWebsiteData(websiteData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      if (__DEV__) {
        console.log('Saving website data:', websiteData);
      }
      
      // Simulate API response
      const savedWebsite: ShopWebsite = {
        id: websiteData.id || `website_${Date.now()}`,
        shopId: websiteData.shopId || 'default_shop',
        ...websiteData,
        updatedAt: new Date().toISOString(),
      } as ShopWebsite;

      // Cache the saved website
      await cacheService.set(`website_${savedWebsite.id}`, savedWebsite, {
        ttl: this.config.cacheTTL,
      });

      // Invalidate related cache entries
      await this.invalidateWebsiteCache(savedWebsite.id);

      return {
        success: true,
        data: savedWebsite,
        timestamp: new Date().toISOString(),
        requestId: `save_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error saving website:', error);
      return {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save website. Please try again.',
        },
        timestamp: new Date().toISOString(),
        requestId: `save_${Date.now()}`,
      };
    }
  }

  /**
   * Publish website with performance optimization
   */
  static async publishWebsite(websiteData: Partial<ShopWebsite>): Promise<APIResponse<{ website: ShopWebsite; liveUrl: string }>> {
    try {
      if (!websiteData.subdomainSlug) {
        throw new Error('Please enter a subdomain slug before publishing.');
      }

      // Validate slug availability
      const slugAvailable = await this.checkSlugAvailability(websiteData.subdomainSlug);
      if (!slugAvailable) {
        // Get alternative suggestions
        const suggestions = await this.suggestAlternativeSlugs(websiteData.subdomainSlug, 3);
        const suggestionText = suggestions.length > 0 
          ? ` Try: ${suggestions.join(', ')}` 
          : '';
        throw new Error(`This subdomain is already taken. Please choose a different one.${suggestionText}`);
      }

      if (__DEV__) {
        console.log('Publishing website:', websiteData);
      }
      
      // Optimize website before publishing
      const optimizedData = await this.optimizeWebsite(websiteData);
      
      // In a real app, this would be an API call
      const publishedWebsite: ShopWebsite = {
        ...optimizedData,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ShopWebsite;

      const liveUrl = this.generateWebsiteUrl(websiteData.subdomainSlug);

      // Cache the published website
      await cacheService.set(`website_${publishedWebsite.id}`, publishedWebsite, {
        ttl: this.config.cacheTTL,
      });

      // Preload template assets
      if (publishedWebsite.templateId) {
        const template = await this.getTemplate(publishedWebsite.templateId);
        if (template) {
          await templateCacheService.preloadTemplateAssets(template);
        }
      }

      return {
        success: true,
        data: {
          website: publishedWebsite,
          liveUrl,
        },
        timestamp: new Date().toISOString(),
        requestId: `publish_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error publishing website:', error);
      return {
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to publish website. Please try again.',
        },
        timestamp: new Date().toISOString(),
        requestId: `publish_${Date.now()}`,
      };
    }
  }

  /**
   * Get template with caching
   */
  static async getTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    try {
      // Try cache first
      const cached = await templateCacheService.getTemplate(templateId);
      if (cached) {
        return cached;
      }

      // For now, return mock data
      const mockTemplate: WebsiteTemplate = {
        id: templateId as any,
        name: 'Modern Template',
        description: 'A modern, responsive template',
        category: 'modern',
        previewImageUrl: `${this.config.cdnUrl}/templates/${templateId}/preview.jpg`,
        defaultColors: {
          primary: '#007AFF',
          secondary: '#5856D6',
        },
        features: {
          hasHeroSection: true,
          hasAboutSection: true,
          hasServicesGrid: true,
          hasTeamSection: true,
          hasPortfolioGallery: true,
          hasReviewsCarousel: true,
          hasContactSection: true,
          hasBookingCTA: true
        },
        mobileOptimized: true,
        tabletOptimized: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Cache the template
      await templateCacheService.setTemplate(templateId, mockTemplate);
      
      return mockTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Get all templates with caching
   */
  static async getAllTemplates(): Promise<WebsiteTemplate[]> {
    try {
      // Try cache first
      const cached = await templateCacheService.getAllTemplates();
      if (cached) {
        return cached;
      }

      // In a real app, this would fetch from API
      const mockTemplates: WebsiteTemplate[] = [
        {
          id: 'modern' as any,
          name: 'Modern Professional',
          description: 'Clean and modern design perfect for professional services',
          category: 'modern',
          previewImageUrl: `${this.config.cdnUrl}/templates/modern/preview.jpg`,
          defaultColors: { primary: '#007AFF', secondary: '#5856D6' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: true,
            hasPortfolioGallery: true,
            hasReviewsCarousel: true,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'classic' as any,
          name: 'Classic Elegance',
          description: 'Timeless design with elegant typography',
          category: 'classic',
          previewImageUrl: `${this.config.cdnUrl}/templates/classic/preview.jpg`,
          defaultColors: { primary: '#8B4513', secondary: '#D2691E' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: false,
            hasPortfolioGallery: true,
            hasReviewsCarousel: true,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'creative' as any,
          name: 'Creative Design',
          description: 'Creative and artistic design for unique businesses',
          category: 'creative',
          previewImageUrl: `${this.config.cdnUrl}/templates/creative/preview.jpg`,
          defaultColors: { primary: '#000000', secondary: '#666666' },
          features: {
            hasHeroSection: true,
            hasAboutSection: true,
            hasServicesGrid: true,
            hasTeamSection: true,
            hasPortfolioGallery: true,
            hasReviewsCarousel: false,
            hasContactSection: true,
            hasBookingCTA: true
          },
          mobileOptimized: true,
          tabletOptimized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Cache the templates
      await templateCacheService.setAllTemplates(mockTemplates);
      
      return mockTemplates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Check slug availability with caching
   */
  static async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      if (!this.validateSlug(slug)) {
        return false;
      }

      // Check cache first
      const cacheKey = `slug_availability_${slug}`;
      const cached = await cacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Check against reserved slugs
      const reservedSlugs = ['api', 'admin', 'www', 'app', 'mobile', 'web', 'help', 'support', 'blog', 'shop', 'store', 'mail', 'email', 'ftp', 'cdn', 'assets', 'static', 'media', 'images', 'css', 'js', 'fonts'];
      if (reservedSlugs.includes(slug.toLowerCase())) {
        await cacheService.set(cacheKey, false, { ttl: this.config.cacheTTL });
        return false;
      }

      // In a real app, this would check against database
      // For now, simulate API call
      const isAvailable = Math.random() > 0.3; // 70% chance of being available

      // Cache the result
      await cacheService.set(cacheKey, isAvailable, { ttl: this.config.cacheTTL });
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Validate slug format
   */
  static validateSlug(slug: string): boolean {
    // Slug must be 3-63 characters, lowercase letters, numbers, and hyphens only
    // Cannot start or end with hyphen
    const slugRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return slugRegex.test(slug);
  }

  /**
   * Suggest alternative slugs
   */
  static async suggestAlternativeSlugs(baseSlug: string, count: number = 3): Promise<string[]> {
    const suggestions: string[] = [];
    
    for (let i = 1; i <= count; i++) {
      suggestions.push(`${baseSlug}${i}`);
    }
    
    // Add random suffix suggestions
    const suffixes = ['pro', 'shop', 'studio', 'salon', 'spa'];
    for (let i = 0; i < Math.min(2, count); i++) {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      suggestions.push(`${baseSlug}-${suffix}`);
    }
    
    return suggestions.slice(0, count);
  }

  /**
   * Generate website URL
   */
  static generateWebsiteUrl(slug: string): string {
    return `https://${slug}.bookerpro.com`;
  }

  /**
   * Validate website data
   */
  static validateWebsiteData(websiteData: Partial<ShopWebsite>): ValidationResult {
    const errors: ValidationError[] = [];

    if (!websiteData.siteTitle?.trim()) {
      errors.push({
        field: 'siteTitle',
        message: 'Site title is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (websiteData.siteTitle && websiteData.siteTitle.length > 100) {
      errors.push({
        field: 'siteTitle',
        message: 'Site title must be 100 characters or less',
        code: 'MAX_LENGTH_EXCEEDED',
      });
    }

    if (websiteData.primaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(websiteData.primaryColor)) {
      errors.push({
        field: 'primaryColor',
        message: 'Primary color must be a valid hex color',
        code: 'INVALID_FORMAT',
      });
    }

    if (websiteData.secondaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(websiteData.secondaryColor)) {
      errors.push({
        field: 'secondaryColor',
        message: 'Secondary color must be a valid hex color',
        code: 'INVALID_FORMAT',
      });
    }

    if (websiteData.subdomainSlug && !this.validateSlug(websiteData.subdomainSlug)) {
      errors.push({
        field: 'subdomainSlug',
        message: 'Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only',
        code: 'INVALID_FORMAT',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Optimize website data before publishing
   */
  static async optimizeWebsite(websiteData: Partial<ShopWebsite>): Promise<Partial<ShopWebsite>> {
    return websiteData;
  }

  /**
   * Analyze website performance
   */
  static async analyzePerformance(websiteData: Partial<ShopWebsite>): Promise<PerformanceMetrics> {
    // Simulate performance analysis
    return {
      loadTime: Math.random() * 2000 + 500,
      firstContentfulPaint: Math.random() * 1000 + 300,
      largestContentfulPaint: Math.random() * 2500 + 1200,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: Math.random() * 100 + 50,
      timeToInteractive: Math.random() * 3000 + 1000,
      totalBlockingTime: Math.random() * 300 + 100,
    };
  }

  /**
   * Get optimization suggestions
   */
  static async getOptimizationSuggestions(websiteData: Partial<ShopWebsite>): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    if (!websiteData.businessBio || websiteData.businessBio.length < 50) {
      suggestions.push({
        type: 'html',
        priority: 'medium',
        title: 'Add more business description',
        description: 'A detailed business description helps customers understand your services better',
        impact: 'Improves SEO and customer engagement',
        effort: 'low',
      });
    }

    if (!websiteData.heroImageUrl) {
      suggestions.push({
        type: 'image',
        priority: 'high',
        title: 'Add a hero image',
        description: 'A compelling hero image makes a strong first impression',
        impact: 'Increases visitor engagement by up to 40%',
        effort: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * Export website data
   */
  static async exportWebsite(websiteId: string, options: ExportOptions): Promise<ExportResult> {
    try {
      // Get website data
      const websiteData = await cacheService.get<ShopWebsite>(`website_${websiteId}`);
      if (!websiteData) {
        throw new Error('Website not found');
      }

      let exportData: string;
      let mimeType: string;

      if (options.format === 'html') {
        if (!websiteData.templateId) {
          throw new Error('No template selected');
        }
        exportData = await this.processTemplate(websiteData, websiteData.templateId, 'html');
        mimeType = 'text/html';
      } else if (options.format === 'pdf' || options.format === 'zip') {
        throw new Error(`Export format ${options.format} not yet implemented`);
      } else {
        throw new Error(`Unsupported export format: ${options.format}`);
      }

      return {
        success: true,
        downloadUrl: `data:${mimeType};base64,${btoa(exportData)}`,
        fileSize: exportData.length,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error exporting website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Invalidate website cache
   */
  static async invalidateWebsiteCache(websiteId: string): Promise<void> {
    await cacheService.remove(`website_${websiteId}`);
    await cacheService.remove(`website_preview_${websiteId}`);
    if (__DEV__) {
      console.log(`Cache invalidated for website ${websiteId}`);
    }
  }

  /**
   * Clear all caches
   */
  static async clearAllCaches(): Promise<void> {
    await cacheService.clear();
    TemplateProcessor.clearProcessingCache();
    if (__DEV__) {
      console.log('All website builder caches cleared');
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    templateCacheSize: number;
    websiteCacheSize: number;
    processingCacheSize: number;
    totalCacheSize: number;
  }> {
    try {
      const templateStats = await templateCacheService.getStats();
      const cacheStats = await cacheService.getStats();
      const templateCacheSize = templateStats.memorySize + templateStats.storageKeys;
      const websiteCacheSize = cacheStats.memorySize + cacheStats.storageKeys;
      const processingCacheSize = (TemplateProcessor as any).PROCESSING_CACHE?.size || 0;
      
      return {
        templateCacheSize,
        websiteCacheSize,
        processingCacheSize,
        totalCacheSize: templateCacheSize + websiteCacheSize + processingCacheSize,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        templateCacheSize: 0,
        websiteCacheSize: 0,
        processingCacheSize: 0,
        totalCacheSize: 0,
      };
    }
  }
}

/**
 * Template Performance Monitor
 */
class TemplatePerformanceMonitor {
  private static metrics = new Map<string, {
    totalProcessingTime: number;
    processCount: number;
    cacheHits: number;
    errors: number;
  }>();

  static recordProcessing(templateId: string, processingTime: number, fromCache: boolean, hasError: boolean): void {
    const current = this.metrics.get(templateId) || {
      totalProcessingTime: 0,
      processCount: 0,
      cacheHits: 0,
      errors: 0,
    };

    this.metrics.set(templateId, {
      totalProcessingTime: current.totalProcessingTime + processingTime,
      processCount: current.processCount + 1,
      cacheHits: current.cacheHits + (fromCache ? 1 : 0),
      errors: current.errors + (hasError ? 1 : 0),
    });
  }

  static getMetrics(templateId: string): any {
    const metrics = this.metrics.get(templateId);
    if (!metrics) return null;

    return {
      averageProcessingTime: metrics.totalProcessingTime / metrics.processCount,
      processCount: metrics.processCount,
      cacheHitRate: (metrics.cacheHits / metrics.processCount) * 100,
      errorRate: (metrics.errors / metrics.processCount) * 100,
    };
  }

  static getAllMetrics(): Map<string, any> {
    const result = new Map();
    this.metrics.forEach((value, key) => {
      result.set(key, this.getMetrics(key));
    });
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}