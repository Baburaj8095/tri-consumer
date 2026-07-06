import logger from '../../utils/logger';

class AnalyticsServiceClass {
  trackScreenViewed(screenName: string) {
    logger.info(`[Analytics] Screen Viewed: ${screenName}`);
  }

  trackSectionViewed(sectionId: string) {
    logger.info(`[Analytics] Section Viewed: ${sectionId}`);
  }

  trackSectionVisibility(sectionId: string, isVisible: boolean) {
    logger.info(`[Analytics] Section Visibility changed: ${sectionId} -> ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
  }

  trackProductImpression(productId: string | number) {
    logger.info(`[Analytics] Product Impression: ${productId}`);
  }

  trackProductClick(productId: string | number) {
    logger.info(`[Analytics] Product Clicked: ${productId}`);
  }

  trackBannerImpression(bannerId: string) {
    logger.info(`[Analytics] Banner Impression: ${bannerId}`);
  }

  trackBannerClick(bannerId: string) {
    logger.info(`[Analytics] Banner Clicked: ${bannerId}`);
  }

  trackServiceClick(serviceName: string) {
    logger.info(`[Analytics] Service Clicked: ${serviceName}`);
  }

  trackSearch(query: string) {
    logger.info(`[Analytics] Search Query submitted: "${query}"`);
  }

  trackCartAction(action: 'add' | 'remove' | 'update', productId: string | number, quantity: number) {
    logger.info(`[Analytics] Cart Action: ${action} | Product: ${productId} | Qty: ${quantity}`);
  }

  trackScrollDepth(depth: number) {
    logger.info(`[Analytics] Scroll Depth reached: ${depth}%`);
  }

  trackError(context: string, errorMessage: string) {
    logger.error(`[Analytics] Error occurred | Context: ${context} | Message: ${errorMessage}`);
  }

  trackOfflineUsage(isOffline: boolean) {
    logger.info(`[Analytics] Connectivity status: ${isOffline ? 'OFFLINE' : 'ONLINE'}`);
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
