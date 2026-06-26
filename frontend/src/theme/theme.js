import { createTheme } from '@mui/material/styles';

// Design Tokens Setup based on Trikonekt Master Transformation Blueprint
export const tokens = {
  colors: {
    primary: '#F97316', // Consumer Commerce Accent
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12, // Buttons
    lg: 16, // Cards
    xl: 20, // Dialogs
    xxl: 24, // Bottom Sheets
  },
  shadows: {
    level1: '0 1px 3px rgba(0,0,0,0.1)',
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
      default: tokens.colors.background,
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
    h1: { fontSize: '2rem', fontWeight: 900, lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 },
    h3: { fontSize: '1.17rem', fontWeight: 800, lineHeight: 1.3 },
    h4: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },
    h5: { fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.4 },
    h6: { fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 800 },
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
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.xl,
        },
      },
    },
  },
});

export default theme;
