import React, { useState } from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import TriCard from './TriCard';
import TriIcon from './TriIcon';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

export default function TriProductCard({
  product,
  onAdd,
  onClick,
}) {
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const hasDiscount = Boolean(product.discount_percent && product.discount_percent > 0);
  const img = product.image || product.image_url || FALLBACK_IMAGE;

  // Resolve product weight/unit
  const weight = product.weight || product.unit || (product.mrp > 150 ? '250 g' : '1 pc');

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setWishlist(!wishlist);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
    onAdd(product);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
    onAdd(product);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  // Hardcode some premium tags
  const tags = [];
  if (product.title?.toLowerCase().includes('mango')) {
    tags.push('Carbide Free', 'Pulp-Rich Sweet');
  } else if (product.title?.toLowerCase().includes('litchi')) {
    tags.push('Season\'s Best');
  } else if (product.title?.toLowerCase().includes('jamun')) {
    tags.push('Freshly Plucked');
  }

  return (
    <TriCard 
      noPadding 
      onClick={onClick}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        width: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: '20px', // Standardized: 20px card radius
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02), 0 2px 6px rgba(0, 0, 0, 0.01)', // Soft shadows
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(255, 122, 0, 0.06)',
          borderColor: 'rgba(255, 122, 0, 0.2)'
        }
      }}
    >
      {/* Product Image Area */}
      <Box 
        sx={{ 
          width: '100%', 
          paddingTop: '90%', // Reduced empty whitespace above details
          position: 'relative', 
          bgcolor: '#F8FAFC',
        }}
      >
        <Box
          component="img"
          src={img}
          alt={product.title}
          sx={{
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'contain', p: 1.5
          }}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />

        {/* Wishlist Heart Icon */}
        <IconButton
          onClick={handleWishlistClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: wishlist ? '#EF4444' : '#64748B',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          <TriIcon 
            name="favorite" 
            size={18} 
            sx={{ 
              color: wishlist ? '#EF4444' : '#64748B',
              fontVariationSettings: wishlist ? '"FILL" 1' : 'none'
            }} 
          />
        </IconButton>

        {/* Discount Badge */}
        {hasDiscount && (
          <Box 
            sx={{
              position: 'absolute', top: 8, left: 8,
              bgcolor: '#FF7A00', color: '#FFFFFF',
              fontSize: '10px', fontWeight: 800,
              px: 1, py: 0.4, borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            {Math.round(product.discount_percent)}% OFF
          </Box>
        )}

        {/* Weight Badge (Pill) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: 'rgba(15, 23, 42, 0.75)',
            color: '#FFFFFF',
            px: 1,
            py: 0.4,
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 700,
            backdropFilter: 'blur(4px)',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {weight}
        </Box>

        {/* ADD Button */}
        <Box sx={{ position: 'absolute', bottom: 6, right: 6 }}>
          {quantity === 0 ? (
            <Box
              onClick={handleAddClick}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#22C55E',
                border: '1.5px solid #22C55E',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '11px',
                px: 2,
                py: 0.5,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
                fontFamily: '"Inter", sans-serif',
                '&:hover': {
                  bgcolor: '#22C55E',
                  color: '#FFFFFF',
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              ADD
            </Box>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                bgcolor: '#22C55E',
                color: '#FFFFFF',
                borderRadius: '10px',
                px: 0.8,
                py: 0.4,
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
              }}
            >
              <IconButton size="small" onClick={handleDecrement} sx={{ color: '#FFFFFF', p: 0.1 }}>
                <TriIcon name="remove" size={14} />
              </IconButton>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, minWidth: 14, textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                {quantity}
              </Typography>
              <IconButton size="small" onClick={handleIncrement} sx={{ color: '#FFFFFF', p: 0.1 }}>
                <TriIcon name="add" size={14} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Product Content Details */}
      <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Pricing Row */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </Typography>
          {hasDiscount && product.mrp > product.price && (
            <Typography sx={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </Typography>
          )}
        </Stack>

        {/* Title */}
        <Typography 
          sx={{ 
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            fontFamily: '"Inter", sans-serif',
            overflow: 'hidden',
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            flex: 1,
            lineHeight: 1.25,
            mb: 0.5
          }}
        >
          {product.title}
        </Typography>

        {/* Hardcoded tags matching mockup */}
        {tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
            {tags.map(tag => (
              <Box
                key={tag}
                sx={{
                  bgcolor: '#FFFDF0',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                  borderRadius: '4px',
                  px: 0.6,
                  py: 0.2,
                  fontSize: '9px',
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  mb: 0.5
                }}
              >
                {tag}
              </Box>
            ))}
          </Stack>
        )}

        {/* Delivery Time, Shop Info, Rating, & Cashback Row */}
        <Stack spacing={0.5} sx={{ mt: 'auto', pt: 0.5, borderTop: '1px solid #F1F5F9' }}>
          <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: '#64748B' }}>
            <TriIcon name="schedule" size={12} color="#64748B" />
            <Typography sx={{ fontSize: '10px', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              10 mins
            </Typography>
            {product.shop_name && (
              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', fontFamily: '"Inter", sans-serif', ml: 0.3 }} noWrap>
                • {product.shop_name}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.3}>
            <TriIcon name="star" size={12} sx={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', fontFamily: '"Inter", sans-serif' }}>
              {product.rating || '4.5'}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#CBD5E1', mx: 0.5 }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#22C55E', fontFamily: '"Inter", sans-serif' }}>
              5% Cashback
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </TriCard>
  );
}
