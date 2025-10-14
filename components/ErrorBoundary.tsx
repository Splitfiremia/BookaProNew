import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Bug, Info } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'critical' | 'warning' | 'info';
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: this.generateErrorId() 
    };
    this.previousResetKeys = props.resetKeys || [];
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('ErrorBoundary caught an error:', error);
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      errorInfo: undefined
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Only process updates if we're in an error state
    if (!this.state.hasError) {
      return;
    }
    
    const { resetKeys } = this.props;
    
    // Reset error state if resetKeys change
    if (resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.length !== prevProps.resetKeys.length ||
        resetKeys.some((key, index) => prevProps.resetKeys![index] !== key);
      
      if (hasResetKeyChanged) {
        console.log('ErrorBoundary: Reset keys changed, clearing error state');
        this.previousResetKeys = resetKeys;
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined,
          errorId: this.generateErrorId()
        });
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location?.href : 'unknown',
    };
    
    console.error('ErrorBoundary details:', errorDetails);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('ErrorBoundary: Error in onError handler:', handlerError);
      }
    }
    
    // In production, you might want to send this to an error reporting service
    if (!__DEV__) {
      console.log('Production error captured:', errorDetails);
    }
  }

  handleRetry = () => {
    console.log('ErrorBoundary: Retrying after error');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  handleAutoRetry = () => {
    console.log('ErrorBoundary: Auto-retry in 3 seconds');
    this.resetTimeoutId = window.setTimeout(() => {
      this.handleRetry();
    }, 3000);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private getErrorSeverityColor(): string {
    switch (this.props.level) {
      case 'critical':
        return COLORS.error;
      case 'warning':
        return '#FF9800';
      case 'info':
        return COLORS.primary;
      default:
        return COLORS.error;
    }
  }

  private getErrorIcon() {
    const color = this.getErrorSeverityColor();
    switch (this.props.level) {
      case 'critical':
        return <AlertTriangle size={48} color={color} />;
      case 'warning':
        return <AlertTriangle size={48} color={color} />;
      case 'info':
        return <Info size={48} color={color} />;
      default:
        return <Bug size={48} color={color} />;
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorSeverityColor = this.getErrorSeverityColor();
      const isMinorError = this.props.level === 'warning' || this.props.level === 'info';

      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {this.getErrorIcon()}
              <Text style={[styles.title, { color: errorSeverityColor }]}>
                {isMinorError ? 'Something needs attention' : 'Something went wrong'}
              </Text>
              <Text style={styles.message}>
                {isMinorError 
                  ? 'We encountered a minor issue. The app should still work normally.'
                  : 'We encountered an unexpected error. Please try again.'}
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                  <Text style={styles.errorText}>{this.state.error.message}</Text>
                  <Text style={styles.errorId}>Error ID: {this.state.errorId}</Text>
                  {this.state.error.stack && (
                    <ScrollView style={styles.stackTrace} horizontal>
                      <Text style={styles.stackText}>{this.state.error.stack}</Text>
                    </ScrollView>
                  )}
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: errorSeverityColor }]} 
                  onPress={this.handleRetry}
                >
                  <RefreshCw size={20} color={COLORS.white} />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                {!isMinorError && (
                  <TouchableOpacity 
                    style={styles.autoRetryButton} 
                    onPress={this.handleAutoRetry}
                  >
                    <Text style={styles.autoRetryButtonText}>Auto-retry in 3s</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  errorDetails: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  errorText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  errorId: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    opacity: 0.7,
    marginBottom: SPACING.sm,
  },
  stackTrace: {
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    padding: SPACING.xs,
  },
  stackText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  autoRetryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  autoRetryButtonText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
});