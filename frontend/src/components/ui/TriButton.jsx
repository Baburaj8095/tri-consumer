import React from 'react';
import { Button } from '@mui/material';

export default function TriButton({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'large', 
  fullWidth = true, 
  sx = {},
  ...props 
}) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      sx={{
        py: size === 'large' ? 1.5 : 1,
        px: 3,
        fontWeight: 800,
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
