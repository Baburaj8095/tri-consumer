export const colors = {
  // Existing tokens (for backward compatibility)
  primary: '#ff7a00',
  primaryDark: '#ea580c',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSoft: '#fff7ed',
  text: '#0f172a',
  textSecondary: '#475569',
  muted: '#94a3b8',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Slate scales (Premium grays)
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',

  // Brand Gradients / Accents
  brandOrangeLight: '#fff7ed',
  brandOrangeMedium: '#ffedd5',
  brandOrangeDeep: '#ff7a00',
  brandOrangeDark: '#c2410c',
  brandGold: '#f59e0b',

  // Semantics & Overlays
  overlayLight: 'rgba(255, 255, 255, 0.9)',
  overlayDark: 'rgba(15, 23, 42, 0.5)',
  overlayCardShadow: 'rgba(0, 0, 0, 0.04)',
  overlayPrimaryLight: 'rgba(255, 122, 0, 0.08)',
  
  // Custom Gradients (Exported as lists of hex values for linear gradients)
  gradientPrimary: ['#ff7a00', '#ea580c'] as const,
  gradientDark: ['#1e293b', '#0f172a'] as const,
  gradientGold: ['#f59e0b', '#d97706'] as const,
  gradientGreen: ['#10b981', '#059669'] as const,
};