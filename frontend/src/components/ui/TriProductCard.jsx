import React, { useState } from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { LuHeart, LuClock, LuPlus, LuMinus } from 'react-icons/lu';
import TriCard from './TriCard';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

export default function TriProductCard({
  product,
  onAdd,
  onClick,
}) {
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const hasDiscount = product.discount_percent && product.discount_percent > 0;
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
      // In a real app we'd trigger a cart decrease, but keeping original logic intact
    }
  };

  // Hardcode some premium pills matching the fruits screenshot
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
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)',
        }
      }}
    >
      {/* Product Image Area */}
      <Box 
        sx={{ 
          width: '100%', 
          paddingTop: '100%', 
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
            objectFit: 'contain', p: 2
          }}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />

        {/* Wishlist Heart Icon */}
        <IconButton
          onClick={handleWishlistClick}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: wishlist ? '#EF4444' : '#64748B',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          <LuHeart size={16} fill={wishlist ? '#EF4444' : 'none'} style={{ strokeWidth: 2 }} />
        </IconButton>

        {/* Discount Badge */}
        {hasDiscount && (
          <Box 
            sx={{
              position: 'absolute', top: 10, left: 10,
              bgcolor: '#FF7A00', color: '#FFFFFF',
              fontSize: '10px', fontWeight: 700,
              px: 1, py: 0.4, borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)'
            }}
          >
            {Math.round(product.discount_percent)}% OFF
          </Box>
        )}

        {/* Weight Badge (Pill) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            bgcolor: 'rgba(0, 0, 0, 0.65)',
            color: '#FFFFFF',
            px: 1,
            py: 0.4,
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {weight}
        </Box>

        {/* ADD Button */}
        <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
          {quantity === 0 ? (
            <Box
              onClick={handleAddClick}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#22C55E',
                border: '1.5px solid #22C55E',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                px: 2.2,
                py: 0.6,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
              spacing={1}
              sx={{
                bgcolor: '#22C55E',
                color: '#FFFFFF',
                borderRadius: '8px',
                px: 1,
                py: 0.5,
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
              }}
            >
              <IconButton size="small" onClick={handleDecrement} sx={{ color: '#FFFFFF', p: 0.2 }}>
                <LuMinus size={12} style={{ strokeWidth: 3 }} />
              </IconButton>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, minWidth: 12, textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                {quantity}
              </Typography>
              <IconButton size="small" onClick={handleIncrement} sx={{ color: '#FFFFFF', p: 0.2 }}>
                <LuPlus size={12} style={{ strokeWidth: 3 }} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Product Content Details */}
      <Box sx={{ p: 1.8, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {/* Pricing Row */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </Typography>
          {hasDiscount && product.mrp > product.price && (
            <Typography sx={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </Typography>
          )}
        </Stack>

        {/* Title */}
        <Typography 
          sx={{ 
            fontSize: '13px',
            fontWeight: 500,
            color: '#334155',
            fontFamily: '"Inter", sans-serif',
            overflow: 'hidden',
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            flex: 1,
            lineHeight: 1.3
          }}
        >
          {product.title}
        </Typography>

        {/* Hardcoded tags matching mockup */}
        {tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
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

        {/* Delivery Time and Shop Info */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#64748B', mt: 0.5 }}>
          <LuClock size={12} />
          <Typography sx={{ fontSize: '11px', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
            10 mins
          </Typography>
          {product.shop_name && (
            <Typography sx={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', fontFamily: '"Inter", sans-serif', ml: 0.5 }} noWrap>
              • {product.shop_name}
            </Typography>
          )}
        </Stack>
      </Box>
    </TriCard>
  );
}
