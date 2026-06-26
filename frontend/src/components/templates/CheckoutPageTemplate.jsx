import React from 'react';
import { Box, Container } from '@mui/material';
import TriAppShell from '../ui/TriAppShell';
import TriHeader from '../ui/TriHeader';

export default function CheckoutPageTemplate({
  title,
  subtitle,
  onBack,
  headerRight,
  stickyAction,
  children,
}) {
  return (
    <TriAppShell hideBottomNav={true} bg="background">
      <TriHeader title={title} subtitle={subtitle} onBack={onBack} rightElement={headerRight} />
      
      {/* Main Content Area */}
      <Container 
        maxWidth="sm" // 600px roughly, tighter for checkout forms
        disableGutters
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          px: { xs: 2, sm: 3 },
          py: 2,
          gap: 2
        }}
      >
        {children}
      </Container>

      {/* Sticky Bottom Action (Usually the Pay / Place Order button) */}
      {stickyAction && (
        <Box 
          sx={{ 
            position: 'sticky', 
            bottom: 0, 
            zIndex: 1040, 
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            pb: `calc(16px + env(safe-area-inset-bottom))`,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.02)'
          }}
        >
          <Container maxWidth="sm" disableGutters>
            {stickyAction}
          </Container>
        </Box>
      )}
    </TriAppShell>
  );
}
