import { useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface LoginPerformanceData {
  authenticationTime: number;
  dataLoadingTime: number;
  dashboardRenderTime: number;
  totalLoginTime: number;
  userRole: string;
  timestamp: number;
}

class LoginPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private loginStartTime: number = 0;
  private authCompleteTime: number = 0;
  private dataLoadCompleteTime: number = 0;
  private dashboardRenderCompleteTime: number = 0;

  // Start tracking login performance
  startLoginTracking() {
    console.log('LoginPerformanceMonitor: Starting login performance tracking');
    this.loginStartTime = Date.now();
    this.startMetric('total_login');
  }

  // Mark authentication completion
  markAuthenticationComplete() {
    console.log('LoginPerformanceMonitor: Authentication completed');
    this.authCompleteTime = Date.now();
    this.endMetric('authentication');
  }

  // Mark data loading completion
  markDataLoadingComplete() {
    console.log('LoginPerformanceMonitor: Data loading completed');
    this.dataLoadCompleteTime = Date.now();
    this.endMetric('data_loading');
  }

  // Mark dashboard render completion
  markDashboardRenderComplete(userRole: string) {
    console.log('LoginPerformanceMonitor: Dashboard render completed for role:', userRole);
    this.dashboardRenderCompleteTime = Date.now();
    this.endMetric('dashboard_render');
    this.endMetric('total_login');
    
    // Calculate and log performance summary
    this.logPerformanceSummary(userRole);
  }

  // Start a performance metric
  private startMetric(name: string, metadata?: Record<string, any>) {
    const startTime = Date.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });
    
    if (Platform.OS === 'web' && performance.mark) {
      performance.mark(`${name}_start`);
    }
  }

  // End a performance metric
  private endMetric(name: string) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn('LoginPerformanceMonitor: Metric not found:', name);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    if (Platform.OS === 'web' && performance.mark && performance.measure) {
      performance.mark(`${name}_end`);
      performance.measure(name, `${name}_start`, `${name}_end`);
    }
    
    console.log(`LoginPerformanceMonitor: ${name} took ${duration}ms`);
  }

  // Log comprehensive performance summary
  private logPerformanceSummary(userRole: string) {
    const authTime = this.authCompleteTime - this.loginStartTime;
    const dataTime = this.dataLoadCompleteTime - this.authCompleteTime;
    const renderTime = this.dashboardRenderCompleteTime - this.dataLoadCompleteTime;
    const totalTime = this.dashboardRenderCompleteTime - this.loginStartTime;

    const performanceData: LoginPerformanceData = {
      authenticationTime: authTime,
      dataLoadingTime: dataTime,
      dashboardRenderTime: renderTime,
      totalLoginTime: totalTime,
      userRole,
      timestamp: Date.now(),
    };

    console.log('=== LOGIN PERFORMANCE SUMMARY ===');
    console.log(`User Role: ${userRole}`);
    console.log(`Authentication: ${authTime}ms`);
    console.log(`Data Loading: ${dataTime}ms`);
    console.log(`Dashboard Render: ${renderTime}ms`);
    console.log(`Total Login Time: ${totalTime}ms`);
    console.log('================================');

    // Identify performance issues
    this.identifyPerformanceIssues(performanceData);
    
    // Store performance data for analytics
    this.storePerformanceData(performanceData);
  }

  // Identify potential performance issues
  private identifyPerformanceIssues(data: LoginPerformanceData) {
    const issues: string[] = [];

    if (data.authenticationTime > 2000) {
      issues.push('Authentication is slow (>2s)');
    }

    if (data.dataLoadingTime > 3000) {
      issues.push('Data loading is slow (>3s)');
    }

    if (data.dashboardRenderTime > 1500) {
      issues.push('Dashboard rendering is slow (>1.5s)');
    }

    if (data.totalLoginTime > 5000) {
      issues.push('Total login time is slow (>5s)');
    }

    if (issues.length > 0) {
      console.warn('LoginPerformanceMonitor: Performance issues detected:');
      issues.forEach(issue => console.warn(`- ${issue}`));
    } else {
      console.log('LoginPerformanceMonitor: Login performance is within acceptable limits');
    }
  }

  // Store performance data for future analysis
  private async storePerformanceData(data: LoginPerformanceData) {
    try {
      // In a real app, you would send this to your analytics service
      // For now, we'll just store it locally for debugging
      const storageKey = `login_performance_${data.timestamp}`;
      
      if (Platform.OS !== 'web') {
        // Use dynamic import for AsyncStorage to avoid bundling issues
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
      
      console.log('LoginPerformanceMonitor: Performance data stored for analysis');
    } catch (error) {
      console.error('LoginPerformanceMonitor: Failed to store performance data:', error);
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
    this.loginStartTime = 0;
    this.authCompleteTime = 0;
    this.dataLoadCompleteTime = 0;
    this.dashboardRenderCompleteTime = 0;
  }
}

// Global performance monitor instance
const loginPerformanceMonitor = new LoginPerformanceMonitor();

// Hook for using login performance monitoring
export function useLoginPerformanceMonitor() {
  const isTrackingRef = useRef(false);

  const startLoginTracking = useCallback(() => {
    if (!isTrackingRef.current) {
      isTrackingRef.current = true;
      loginPerformanceMonitor.startLoginTracking();
    }
  }, []);

  const markAuthenticationComplete = useCallback(() => {
    if (isTrackingRef.current) {
      loginPerformanceMonitor.markAuthenticationComplete();
    }
  }, []);

  const markDataLoadingComplete = useCallback(() => {
    if (isTrackingRef.current) {
      loginPerformanceMonitor.markDataLoadingComplete();
    }
  }, []);

  const markDashboardRenderComplete = useCallback((userRole: string) => {
    if (isTrackingRef.current) {
      loginPerformanceMonitor.markDashboardRenderComplete(userRole);
      isTrackingRef.current = false; // Reset tracking
    }
  }, []);

  const clearMetrics = useCallback(() => {
    isTrackingRef.current = false;
    loginPerformanceMonitor.clearMetrics();
  }, []);

  return {
    startLoginTracking,
    markAuthenticationComplete,
    markDataLoadingComplete,
    markDashboardRenderComplete,
    clearMetrics,
    getMetrics: () => loginPerformanceMonitor.getMetrics(),
  };
}

// Hook for component render performance tracking
export function useRenderPerformanceTracking(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    // Track component mount time
    mountTime.current = Date.now();
    console.log(`RenderPerformance: ${componentName} mounted at ${mountTime.current}`);

    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTime.current;
      console.log(`RenderPerformance: ${componentName} unmounted after ${lifespan}ms`);
    };
  }, [componentName]);

  const startRenderTracking = useCallback(() => {
    renderStartTime.current = Date.now();
  }, []);

  const endRenderTracking = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = Date.now() - renderStartTime.current;
      console.log(`RenderPerformance: ${componentName} render took ${renderTime}ms`);
      
      if (renderTime > 100) {
        console.warn(`RenderPerformance: ${componentName} render is slow (${renderTime}ms)`);
      }
      
      renderStartTime.current = 0;
    }
  }, [componentName]);

  return {
    startRenderTracking,
    endRenderTracking,
  };
}

// Utility function to measure async operations
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  console.log(`AsyncOperation: Starting ${name}`);
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    console.log(`AsyncOperation: ${name} completed in ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`AsyncOperation: ${name} is slow (${duration}ms)`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`AsyncOperation: ${name} failed after ${duration}ms:`, error);
    throw error;
  }
}

export default loginPerformanceMonitor;