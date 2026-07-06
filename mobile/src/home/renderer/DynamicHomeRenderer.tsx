import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlockConfig } from '../models/models';
import { SectionRegistry } from '../registry/SectionRegistry';
import { AnalyticsService } from '../services/AnalyticsService';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';

// Section-level Error Boundary for crash isolation
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionId: string; type: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const msg = error.message || 'Unknown render error';
    AnalyticsService.trackError(`SectionErrorBoundary:${this.props.sectionId}:${this.props.type}`, msg);
  }

  render() {
    if (this.state.hasError) {
      const SectionDef = SectionRegistry.getSection(this.props.type);
      if (SectionDef.errorComponent) {
        const ErrorComp = SectionDef.errorComponent;
        return <ErrorComp sectionId={this.props.sectionId} />;
      }

      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Unable to display this section</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

interface DynamicHomeRendererProps {
  blocks: BlockConfig[];
  contentData: any; // All content fetched from useHomeContent
  navigation: any;
  coordinator: any;
}

export const DynamicHomeRenderer: React.FC<DynamicHomeRendererProps> = ({
  blocks,
  contentData,
  navigation,
  coordinator,
}) => {
  return (
    <>
      {blocks.map((block) => {
        const sectionDef = SectionRegistry.getSection(block.type);
        const Component = sectionDef.component;

        // Progressive loading: if section-specific data is loading, show its skeleton
        const isContentLoading = contentData.loadingStates[block.type] || false;
        if (isContentLoading && sectionDef.skeleton) {
          const SkeletonComp = sectionDef.skeleton;
          return <SkeletonComp key={`skel-${block.id}`} />;
        }

        // Error rendering: if content repository failed, show error Component
        const contentError = contentData.errorStates[block.type] || null;
        if (contentError && sectionDef.errorComponent) {
          const ErrorComp = sectionDef.errorComponent;
          return <ErrorComp key={`err-${block.id}`} errorMessage={contentError} />;
        }

        // Track impression when section is displayed
        if (sectionDef.analyticsKey) {
          AnalyticsService.trackSectionViewed(block.id);
        }

        return (
          <SectionErrorBoundary key={block.id} sectionId={block.id} type={block.type}>
            <Component
              block={block}
              content={contentData}
              navigation={navigation}
              coordinator={coordinator}
            />
          </SectionErrorBoundary>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  errorCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: radius.md,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '800',
    textAlign: 'center',
  },
});
