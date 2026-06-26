import React from 'react';
import { Box, useTheme } from '@mui/material';
import BottomNav from '../../pages/consumer-ecommerce/components/BottomNav';

export default function TriAppShell({ 
  children, 
  hideBottomNav = false,
  bottomNavIndex = 0,
  bg = 'background' // 'background' or 'surface'
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: bg === 'surface' ? theme.palette.background.paper : theme.palette.background.default,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        pb: hideBottomNav ? 'env(safe-area-inset-bottom)' : 'calc(65px + env(safe-area-inset-bottom))',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>

      {!hideBottomNav && (
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
          {/* We will eventually refactor BottomNav to use MUI too, but for now we reuse existing to not break flow */}
          <BottomNav value={bottomNavIndex} />
        </Box>
      )}
    </Box>
  );
}
