import React from 'react';
import { Box, Container } from '@mui/material';
import TriAppShell from '../ui/TriAppShell';
import TriHeader from '../ui/TriHeader';

export default function ShoppingPageTemplate({
  title,
  subtitle,
  onBack,
  headerRight,
  searchBar,
  filterChips,
  bottomNavIndex,
  hideBottomNav = false,
  stickyAction,
  children,
}) {
  return (
    <TriAppShell bottomNavIndex={bottomNavIndex} hideBottomNav={hideBottomNav}>
      <TriHeader title={title} subtitle={subtitle} onBack={onBack} rightElement={headerRight} />
      
      {/* Search and Filters area */}
      {(searchBar || filterChips) && (
        <Box 
          sx={{ 
            position: 'sticky', 
            top: '56px', 
            zIndex: 1050, 
            bgcolor: 'rgba(248, 250, 252, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '430px' }}>
            {searchBar && <Box sx={{ px: 2, pt: 1 }}>{searchBar}</Box>}
            {filterChips && <Box sx={{ pt: 1, pl: 2, overflowX: 'auto', display: 'flex' }}>{filterChips}</Box>}
          </Box>
        </Box>
      )}

      {/* Main Content Area constrained by width tokens */}
      <Container 
        disableGutters
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          px: { xs: 2, sm: 3 }, // 16px on mobile, 24px on larger
          py: 2,
          maxWidth: '430px !important',
          width: '100%',
          margin: '0 auto'
        }}
      >
        {children}
      </Container>

      {/* Sticky Bottom Action */}
      {stickyAction && (
        <Box 
          sx={{ 
            position: 'sticky', 
            bottom: hideBottomNav ? 0 : '65px', 
            zIndex: 1040, 
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            pb: `calc(16px + env(safe-area-inset-bottom))`,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <Container disableGutters sx={{ maxWidth: '430px !important', width: '100%', margin: '0 auto' }}>
            {stickyAction}
          </Container>
        </Box>
      )}
    </TriAppShell>
  );
}
