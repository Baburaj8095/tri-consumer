import React from 'react';
import { Box, Typography, Radio } from '@mui/material';
import { FaHouse, FaBriefcase, FaBuilding, FaTrash } from 'react-icons/fa6';
import TriCard from './TriCard';
import TriButton from './TriButton';

export default function TriAddressCard({
  address,
  selected = false,
  onSelect,
  onDelete,
}) {
  const getIcon = () => {
    switch(address.addressType) {
      case 'HOME': return <FaHouse />;
      case 'WORK': return <FaBriefcase />;
      default: return <FaBuilding />;
    }
  };

  return (
    <TriCard 
      onClick={onSelect}
      sx={{ 
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'rgba(249, 115, 22, 0.03)' : 'background.paper',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <Radio 
        checked={selected} 
        onChange={onSelect} 
        color="primary"
        sx={{ p: 0, mt: 0.5 }} 
      />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h6" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon()} {address.addressType || 'ADDRESS'}
          </Typography>
          {address.isDefault && (
            <Typography variant="caption" sx={{ bgcolor: 'primary.main', color: '#fff', px: 1, borderRadius: 1, fontWeight: 800 }}>
              DEFAULT
            </Typography>
          )}
        </Box>
        <Typography variant="h5" color="text.primary" mb={0.5}>
          {address.recipientsName} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {address.recipientsPhone}</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
          {address.landmark && `Near ${address.landmark}, `}
          {address.city} - {address.pincode}
        </Typography>
      </Box>

      {onDelete && (
        <TriButton 
          variant="text" 
          color="error" 
          size="small" 
          sx={{ minWidth: 'auto', p: 1, position: 'absolute', top: 8, right: 8 }}
          onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
        >
          <FaTrash />
        </TriButton>
      )}
    </TriCard>
  );
}
