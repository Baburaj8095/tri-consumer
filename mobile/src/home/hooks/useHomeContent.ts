import { useState, useEffect, useCallback } from 'react';
import { ProductRepository, MerchantRepository, BannerRepository, CategoryRepository } from '../repository/ContentRepositories';
import { Product, Shop } from '../../types/domain';
import { AnalyticsService } from '../services/AnalyticsService';

const productRepo = new ProductRepository();
const merchantRepo = new MerchantRepository();
const bannerRepo = new BannerRepository();
const categoryRepo = new CategoryRepository();

export function useHomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<Shop[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    products: true,
    merchants: true,
    banners: true,
    categories: true,
  });

  const [errorStates, setErrorStates] = useState<{ [key: string]: string | null }>({
    products: null,
    merchants: null,
    banners: null,
    categories: null,
  });

  const fetchProducts = useCallback(async (force = false) => {
    setLoadingStates(prev => ({ ...prev, products: true }));
    setErrorStates(prev => ({ ...prev, products: null }));
    try {
      const data = await productRepo.getProducts(force);
      setProducts(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch products';
      setErrorStates(prev => ({ ...prev, products: msg }));
      AnalyticsService.trackError('useHomeContent:products', msg);
    } finally {
      setLoadingStates(prev => ({ ...prev, products: false }));
    }
  }, []);

  const fetchMerchants = useCallback(async (force = false) => {
    setLoadingStates(prev => ({ ...prev, merchants: true }));
    setErrorStates(prev => ({ ...prev, merchants: null }));
    try {
      const data = await merchantRepo.getMerchants(force);
      setMerchants(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch merchants';
      setErrorStates(prev => ({ ...prev, merchants: msg }));
      AnalyticsService.trackError('useHomeContent:merchants', msg);
    } finally {
      setLoadingStates(prev => ({ ...prev, merchants: false }));
    }
  }, []);

  const fetchBanners = useCallback(async (force = false) => {
    setLoadingStates(prev => ({ ...prev, banners: true }));
    setErrorStates(prev => ({ ...prev, banners: null }));
    try {
      const data = await bannerRepo.getBanners(force);
      setBanners(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch banners';
      setErrorStates(prev => ({ ...prev, banners: msg }));
      AnalyticsService.trackError('useHomeContent:banners', msg);
    } finally {
      setLoadingStates(prev => ({ ...prev, banners: false }));
    }
  }, []);

  const fetchCategories = useCallback(async (force = false) => {
    setLoadingStates(prev => ({ ...prev, categories: true }));
    setErrorStates(prev => ({ ...prev, categories: null }));
    try {
      const data = await categoryRepo.getCategories(force);
      setCategories(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch categories';
      setErrorStates(prev => ({ ...prev, categories: msg }));
      AnalyticsService.trackError('useHomeContent:categories', msg);
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }));
    }
  }, []);

  const loadAllContent = useCallback((force = false) => {
    // Fire all fetches in parallel. Sells render progressively as data arrives.
    void fetchProducts(force);
    void fetchMerchants(force);
    void fetchBanners(force);
    void fetchCategories(force);
  }, [fetchProducts, fetchMerchants, fetchBanners, fetchCategories]);

  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  return {
    products,
    merchants,
    banners,
    categories,
    loadingStates,
    errorStates,
    refreshContent: () => loadAllContent(true),
  };
}
