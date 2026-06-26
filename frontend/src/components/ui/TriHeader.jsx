import React from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

export default function TriHeader({ 
  title, 
  subtitle,
  onBack, 
  rightElement,
  transparent = false
}) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100, // Above normal content but below modals
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1, // small padding since IconButton has padding
        background: transparent ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: transparent ? 'none' : 'blur(10px)',
        borderBottom: transparent ? 'none' : `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ width: '48px', display: 'flex', justifyContent: 'center' }}>
        <IconButton onClick={handleBack} sx={{ color: theme.palette.text.primary }}>
          <FaArrowLeft size={18} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 800,
            fontSize: '1.05rem',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            noWrap 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 700,
              display: 'block',
              mt: -0.5
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {rightElement}
      </Box>
    </Box>
  );
}
