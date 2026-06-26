import { createTheme } from '@mui/material/styles';

// Design Tokens Setup based on Trikonekt Master Transformation Blueprint
export const tokens = {
  colors: {
    primary: '#FF7A00', // Trikonekt Premium Orange
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#FFFFFF', // Clean White Background
    secondaryBg: '#F8F9FB', // Secondary Background
    surface: '#FFFFFF',
    border: '#E2E8F0', // Sleek slate border
    textPrimary: '#1E293B', // Dark Slate Gray
    textSecondary: '#64748B', // Cool Muted Slate
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12, // Buttons: 12px
    lg: 20, // Cards: 20px
    xl: 18, // Search Bar: 18px
    xxl: 24, // Bottom Sheets: 24px
  },
  shadows: {
    level1: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
    premium: '0 10px 30px -5px rgba(255, 122, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
    tabBar: '0 -4px 16px rgba(0, 0, 0, 0.04)',
  },
  motion: {
    screen: 250,
    bottomSheet: 280,
    dialog: 220,
    snackbar: 200,
    cardHover: 180,
    button: 120,
  }
};

const theme = createTheme({
  palette: {
    primary: {
      main: tokens.colors.primary,
      contrastText: '#FFFFFF',
    },
    success: {
      main: tokens.colors.success,
    },
    warning: {
      main: tokens.colors.warning,
    },
    error: {
      main: tokens.colors.error,
    },
    info: {
      main: tokens.colors.info,
    },
    background: {
      default: tokens.colors.secondaryBg,
      paper: tokens.colors.surface,
    },
    text: {
      primary: tokens.colors.textPrimary,
      secondary: tokens.colors.textSecondary,
    },
    divider: tokens.colors.border,
  },
  typography: {
    fontFamily: tokens.typography.fontFamily,
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 },
    h5: { fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4 },
    h6: { fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
  },
  shape: {
    borderRadius: tokens.radius.sm,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          boxShadow: 'none',
          transition: `all ${tokens.motion.button}ms ease`,
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.lg,
          boxShadow: tokens.shadows.level1,
          border: `1px solid ${tokens.colors.border}`,
          transition: `all ${tokens.motion.cardHover}ms ease`,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.xxl,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
