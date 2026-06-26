import React from 'react';
import { Box } from '@mui/material';

export default function TriIcon({ name, size = 24, color = 'inherit', sx = {}, ...props }) {
  return (
    <Box
      component="span"
      className="material-symbols-rounded"
      sx={{
        fontSize: `${size}px`,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        userSelect: 'none',
        verticalAlign: 'middle',
        ...sx,
      }}
      {...props}
    >
      {name}
    </Box>
  );
}
