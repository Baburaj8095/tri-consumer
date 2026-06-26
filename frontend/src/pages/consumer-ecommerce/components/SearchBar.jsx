import React, { useState, useEffect } from 'react';
import { Box, InputBase, IconButton, Stack } from '@mui/material';
import TriIcon from '../../../components/ui/TriIcon';

export default function SearchBar({ 
  placeholder = 'Search services, products, & more...', 
  value = '',
  onChange,
  onSearch,
  onVoiceClick,
  onCameraClick,
  variant = 'light', // 'light' for orange background headers (white search bar), 'dark' for white page backgrounds (light grey search bar)
  sx = {}
}) {
  const placeholders = [
    'Search fresh fruits & veggies...',
    'Search restaurants & food...',
    'Search local stores near you...',
    'Search secure bill payments...',
    'Search parcel drop & pickups...'
  ];
  
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const isLight = variant === 'light';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: isLight ? '#FFFFFF' : '#F1F5F9',
        border: '1px solid',
        borderColor: isLight ? 'rgba(0,0,0,0.04)' : '#E2E8F0',
        borderRadius: '18px', // search bar radius design token
        px: 2,
        py: 0.5,
        boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.2s ease',
        '&:focus-within': {
          boxShadow: '0 4px 18px rgba(255, 122, 0, 0.12)',
          borderColor: '#FF7A00',
          bgcolor: '#FFFFFF'
        },
        width: '100%',
        ...sx
      }}
    >
      <TriIcon 
        name="search" 
        size={22} 
        color={isLight ? '#FF7A00' : '#64748B'} 
        sx={{ mr: 1, cursor: 'pointer' }}
        onClick={() => onSearch && onSearch(value)}
      />
      <InputBase
        placeholder={value ? '' : (placeholder || placeholders[currentPlaceholderIndex])}
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        sx={{
          flex: 1,
          fontSize: '14px',
          color: '#1E293B',
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500,
          '& input::placeholder': {
            color: '#94A3B8',
            opacity: 1,
            transition: 'opacity 0.3s ease'
          }
        }}
      />
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton 
          size="small" 
          onClick={onCameraClick}
          sx={{ color: isLight ? '#FF7A00' : '#64748B', p: 0.5 }}
        >
          <TriIcon name="qr_code_scanner" size={20} />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={onVoiceClick}
          sx={{ color: isLight ? '#FF7A00' : '#64748B', p: 0.5 }}
        >
          <TriIcon name="mic" size={20} />
        </IconButton>
      </Stack>
    </Box>
  );
}
