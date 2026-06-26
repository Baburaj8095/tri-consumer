import React from 'react';
import { Box, Typography } from '@mui/material';
import TriButton from './TriButton';

export default function TriEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        flex: 1
      }}
    >
      {Icon && (
        <Box sx={{ color: 'text.secondary', opacity: 0.5, mb: 2 }}>
          <Icon size={64} />
        </Box>
      )}
      <Typography variant="h5" color="text.primary" fontWeight={800} mb={1}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4} sx={{ maxWidth: 300 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <TriButton onClick={onAction} sx={{ minWidth: 200 }}>
          {actionLabel}
        </TriButton>
      )}
    </Box>
  );
}
