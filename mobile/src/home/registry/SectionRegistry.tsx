import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnalyticsService } from '../services/AnalyticsService';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export interface SectionDefinition {
  component: React.ComponentType<any>;
  skeleton?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<any>;
  emptyComponent?: React.ComponentType<any>;
  permissionRule?: string;
  analyticsKey?: string;
  defaultStyles?: any;
  cachePolicy?: string;
}

// Fallback Placeholder View for Unknown Components
const UnknownComponentPlaceholder: React.FC<{ type: string }> = ({ type }) => {
  React.useEffect(() => {
    AnalyticsService.trackError('SectionRegistry', `Attempted to render unknown block type: "${type}"`);
  }, [type]);

  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackTitle}>Section Unavailable</Text>
      <Text style={styles.fallbackSubtitle}>
        The section "{type}" requires a newer app update.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: colors.slate100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    ...shadows.sm,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate800,
  },
  fallbackSubtitle: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 4,
  },
});

class SectionRegistryClass {
  private registry: Map<string, SectionDefinition> = new Map();

  registerSection(type: string, definition: SectionDefinition) {
    this.registry.set(type, definition);
  }

  getSection(type: string): SectionDefinition {
    const section = this.registry.get(type);
    
    if (section) {
      return section;
    }

    // Default Fallback Section definition for unknown types
    return {
      component: () => <UnknownComponentPlaceholder type={type} />,
      skeleton: () => <View style={{ height: 100, backgroundColor: colors.slate50, margin: 16, borderRadius: radius.md }} />,
      errorComponent: () => null,
      emptyComponent: () => null,
    };
  }

  getRegisteredKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const SectionRegistry = new SectionRegistryClass();
export { UnknownComponentPlaceholder };
