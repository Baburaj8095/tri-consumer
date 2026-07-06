export interface StyleConfig {
  layout?: 'horizontal' | 'vertical' | 'grid' | 'carousel';
  columns?: number;
  cardStyle?: 'square' | 'rounded' | 'premium';
  card?: 'square' | 'rounded' | 'premium';
  aspectRatio?: number;
  margin?: number;
  padding?: number;
}

export interface VisibilityRules {
  primeOnly?: boolean;
  locationRequired?: boolean;
  minAppVersion?: string;
}

export interface ExperimentConfig {
  experimentId?: string;
  variant?: string;
  rollout?: number; // 0 to 100 percentage
}

export interface BlockConfig {
  id: string;
  type: string;
  componentVersion?: number;
  enabled: boolean;
  style?: StyleConfig;
  visibility?: VisibilityRules;
  experiment?: ExperimentConfig;
}

export interface LayoutConfig {
  layoutVersion: number;
  rendererVersion: number;
  cacheVersion?: number;
  blocks: BlockConfig[];
}
