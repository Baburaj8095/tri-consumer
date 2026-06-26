import React from 'react';
import { Card, CardContent } from '@mui/material';

export default function TriCard({ 
  children, 
  noPadding = false, 
  sx = {}, 
  onClick,
  ...props 
}) {
  return (
    <Card 
      onClick={onClick}
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        ...sx 
      }} 
      {...props}
    >
      <CardContent sx={{ p: noPadding ? 0 : 2, '&:last-child': { pb: noPadding ? 0 : 2 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
