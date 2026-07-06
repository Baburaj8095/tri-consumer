import { LayoutConfig } from '../models/models';

export const CURRENT_RENDERER_VERSION = 1;
export const CURRENT_LAYOUT_VERSION = 1;

export const DEFAULT_LAYOUT: LayoutConfig = {
  layoutVersion: CURRENT_LAYOUT_VERSION,
  rendererVersion: CURRENT_RENDERER_VERSION,
  cacheVersion: 1,
  blocks: [
    { id: 'services', type: 'services', enabled: true, componentVersion: 1, style: { layout: 'horizontal', card: 'square' } },
    { id: 'explore', type: 'explore', enabled: true, componentVersion: 1, style: { card: 'premium' } },
    { id: 'deals', type: 'deals', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'giftCards', type: 'giftCards', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'adz', type: 'adz', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'features', type: 'features', enabled: true, componentVersion: 1, style: { layout: 'grid' } },
    { id: 'categories', type: 'categories', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'cashback', type: 'cashback', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'banners', type: 'banners', enabled: true, componentVersion: 1, style: { layout: 'vertical' } },
    { id: 'visited', type: 'visited', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'clothing', type: 'clothing', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'nearby', type: 'nearby', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
    { id: 'personalized', type: 'personalized', enabled: true, componentVersion: 1, style: { layout: 'carousel' } },
  ],
};
