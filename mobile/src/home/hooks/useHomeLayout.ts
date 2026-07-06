import { useState, useEffect, useCallback } from 'react';
import { HomeRepository } from '../repository/HomeRepository';
import { BlockConfig, LayoutConfig } from '../models/models';
import { CURRENT_RENDERER_VERSION, DEFAULT_LAYOUT } from '../constants/constants';
import { useAuthStore } from '../../store/authStore';
import { AnalyticsService } from '../services/AnalyticsService';

const homeRepo = new HomeRepository();

/**
 * Deterministically checks if a user falls within a rollout percentage.
 */
function isUserInRollout(userId: string | number | undefined, rolloutPercent: number): boolean {
  if (rolloutPercent >= 100) return true;
  if (rolloutPercent <= 0) return false;
  
  const idStr = String(userId || 'anonymous');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bucket = Math.abs(hash) % 100;
  return bucket < rolloutPercent;
}

export function useHomeLayout() {
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useAuthStore();
  const userId = user?.id || '';

  const loadLayout = useCallback(async (force = false) => {
    try {
      const layoutData: LayoutConfig = await homeRepo.getLayout(force);
      
      // Validation check: check if renderer is capable of rendering this layout version
      if (layoutData.rendererVersion > CURRENT_RENDERER_VERSION) {
        AnalyticsService.trackError(
          'useHomeLayout',
          `Renderer Version mismatch. Required: ${layoutData.rendererVersion}, Client: ${CURRENT_RENDERER_VERSION}`
        );
        // Graceful fallback to default layout
        setBlocks(DEFAULT_LAYOUT.blocks);
        return;
      }

      // Filter and process layout blocks based on status, minAppVersion, and rollouts
      const activeBlocks = layoutData.blocks.filter((block: BlockConfig) => {
        if (!block.enabled) return false;
        
        // Validation check: Ensure block contains required keys
        if (!block.id || !block.type) {
          AnalyticsService.trackError('useHomeLayout', `Invalid block schema ignored: ${JSON.stringify(block)}`);
          return false;
        }

        // Experiment rollout validation
        if (block.experiment && block.experiment.rollout !== undefined) {
          const inRollout = isUserInRollout(userId, block.experiment.rollout);
          if (!inRollout) {
            return false;
          }
        }
        
        // Visibility rules (like primeOnly)
        if (block.visibility?.primeOnly) {
          const isPrime = (user as any)?.membership?.toLowerCase().includes('prime') || false;
          if (!isPrime) return false;
        }

        return true;
      });

      setBlocks(activeBlocks);
    } catch (error) {
      AnalyticsService.trackError('useHomeLayout', error instanceof Error ? error.message : 'Unknown layout fetch error');
      setBlocks(DEFAULT_LAYOUT.blocks);
    }
  }, [userId, (user as any)?.membership]);

  const refreshLayout = useCallback(async () => {
    setRefreshing(true);
    await loadLayout(true);
    setRefreshing(false);
  }, [loadLayout]);

  useEffect(() => {
    loadLayout().finally(() => setLoading(false));
  }, [loadLayout]);

  return {
    blocks,
    loading,
    refreshing,
    refreshLayout,
  };
}
