import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { LuMapPin, LuCalendar, LuHash, LuChevronRight } from 'react-icons/lu';
import TriCard from './TriCard';

export default function TriOrderCard({ order, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Confirmed':
      case 'Shipped': return 'info';
      case 'Cancelled': return 'error';
      case 'Returned': return 'warning';
      default: return 'default';
    }
  };

  return (
    <TriCard onClick={onClick} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            component="img" 
            src={order.shopImage} 
            alt={order.shopName} 
            sx={{ width: 40, height: 40, borderRadius: 2, objectFit: 'cover', bgcolor: 'background.default' }} 
          />
          <Box>
            <Typography variant="h6" fontWeight={800}>{order.shopName}</Typography>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <LuHash size={12} /> {order.orderId}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={order.status} 
          size="small" 
          color={getStatusColor(order.status)} 
          sx={{ fontWeight: 800, height: 24 }} 
        />
      </Box>
      
      <Typography variant="body2" color="text.primary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {order.itemsText}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <LuCalendar size={12} /> {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            ₹{order.amount.toFixed(2)}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ bgcolor: 'background.default' }}>
          <LuChevronRight size={16} />
        </IconButton>
      </Box>
    </TriCard>
  );
}
