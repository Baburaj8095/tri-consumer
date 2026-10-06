import React, { useEffect, useState } from 'react';

/**
 * GlassMetamorphosisBackground
 * Renders the living, morphing chromatic glass canvas with:
 * - Fluid floating mesh orbs: Orange, Green, White, and Deep Navy Blue
 * - Ambient caustics and specular noise overlay
 * - Subtle cursor-tracked lighting highlight
 */
export default function GlassMetamorphosisBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="gm-canvas-background" aria-hidden="true">
      {/* 1. Deep Navy Oceanic Base Orb */}
      <div className="gm-orb gm-orb-navy" />

      {/* 2. Vibrant Saffron / Orange Morphing Orb */}
      <div className="gm-orb gm-orb-orange" />

      {/* 3. Radiant Emerald / Green Morphing Orb */}
      <div className="gm-orb gm-orb-green" />

      {/* 4. Crystalline White Specular Halo */}
      <div className="gm-orb gm-orb-white" />

      {/* 5. Warm Champagne & Beige Morphing Orb */}
      <div className="gm-orb gm-orb-beige" />

      {/* Dynamic Cursor Light Caustic Reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 450px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 107, 0, 0.12), rgba(0, 229, 153, 0.08) 40%, transparent 70%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          transition: 'background 0.15s ease-out',
        }}
      />

      {/* Caustic Grid Texture */}
      <div className="gm-caustic-grid" />
    </div>
  );
}

