import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import {
  LuHouse,
  LuScanLine,
  LuShoppingBag,
  LuStore,
  LuBoxes,
} from 'react-icons/lu';

const tabs = [
  { label: 'Home', icon: LuHouse, to: '/consumer-ecommerce' },
  { label: 'Tri Zone', icon: LuBoxes, to: '/consumer-ecommerce/tri-zone' },
  { label: 'Scanner', icon: LuScanLine, to: '/consumer-ecommerce/scanner', center: true },
  { label: 'Online', icon: LuShoppingBag, to: '/consumer-ecommerce/delivery' },
  { label: 'Nearby', icon: LuStore, to: '/consumer-ecommerce/nearby-stores' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        bgcolor: '#FFFFFF',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
        borderTop: '1px solid',
        borderColor: 'grey.100',
        zIndex: 1000,
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 1,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(({ label, icon: Icon, to, center }) => {
        const isActive = to === '/consumer-ecommerce' 
          ? location.pathname === to 
          : location.pathname.startsWith(to);

        if (center) {
          return (
            <Box
              key={label}
              component={NavLink}
              to={to}
              sx={{
                position: 'relative',
                top: '-18px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                bgcolor: '#FF7A00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(255, 122, 0, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: '0 10px 28px rgba(255, 122, 0, 0.45)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              <Icon style={{ fontSize: 26, strokeWidth: 2.2 }} />
            </Box>
          );
        }

        return (
          <Box
            key={label}
            component={NavLink}
            to={to}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? '#FF7A00' : 'grey.400',
              width: '60px',
              height: '100%',
              transition: 'all 0.15s ease',
              '&:hover': {
                color: isActive ? '#FF7A00' : 'grey.600',
              }
            }}
          >
            <Box sx={{ display: 'flex', position: 'relative', mb: 0.5 }}>
              <Icon style={{ fontSize: 20, strokeWidth: isActive ? 2.2 : 1.8 }} />
            </Box>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: '"Inter", sans-serif',
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
