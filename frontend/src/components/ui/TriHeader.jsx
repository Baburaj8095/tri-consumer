import React from 'react';
import Header from '../../pages/consumer-ecommerce/components/Header';

export default function TriHeader({ 
  title, 
  subtitle,
  onBack, 
  rightElement,
  transparent = false
}) {
  return (
    <Header 
      mode="compact" 
      title={title} 
      subtitle={subtitle} 
      onBack={onBack} 
    />
  );
}
