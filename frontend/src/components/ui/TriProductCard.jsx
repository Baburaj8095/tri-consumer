import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { FaShoppingCart, FaStore } from 'react-icons/fa';
import TriCard from './TriCard';
import TriButton from './TriButton';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

export default function TriProductCard({
  product,
  onAdd,
  onClick,
}) {
  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const img = product.image || product.image_url || FALLBACK_IMAGE;

  return (
    <TriCard 
      noPadding 
      onClick={onClick}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          width: '100%', 
          paddingTop: '100%', 
          position: 'relative', 
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box
          component="img"
          src={img}
          alt={product.title}
          sx={{
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'contain', mixBlendMode: 'multiply', p: 1.5
          }}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        {hasDiscount && (
          <Box 
            sx={{
              position: 'absolute', top: 8, left: 8,
              bgcolor: 'error.main', color: '#fff',
              fontSize: '0.65rem', fontWeight: 800,
              px: 1, py: 0.5, borderRadius: 1,
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
            }}
          >
            {Math.round(product.discount_percent)}% OFF
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            overflow: 'hidden', display: '-webkit-box', 
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            flex: 1
          }}
        >
          {product.title}
        </Typography>

        {product.shop_name && (
          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <FaStore style={{ marginRight: 4, color: '#f97316' }} />
            {product.shop_name}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="h4" sx={{ color: 'text.primary' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </Typography>
          {hasDiscount && product.mrp > product.price && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <TriButton
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          size="small"
          startIcon={<FaShoppingCart />}
        >
          Add to Cart
        </TriButton>
      </Box>
    </TriCard>
  );
}
