import { Product, Shop } from '../../types/domain';

export interface ILayoutRepository {
  getLayout(forceRefresh?: boolean): Promise<any>;
  clearCache(): Promise<void>;
}

export interface IProductRepository {
  getProducts(forceRefresh?: boolean): Promise<Product[]>;
  clearCache(): Promise<void>;
}

export interface IMerchantRepository {
  getMerchants(forceRefresh?: boolean): Promise<Shop[]>;
  clearCache(): Promise<void>;
}

export interface IBannerRepository {
  getBanners(forceRefresh?: boolean): Promise<any[]>;
  clearCache(): Promise<void>;
}

export interface ICategoryRepository {
  getCategories(forceRefresh?: boolean): Promise<any[]>;
  clearCache(): Promise<void>;
}
