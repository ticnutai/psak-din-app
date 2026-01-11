import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme Types
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  
  // Secondary/Accent
  accent: string;
  accentHover: string;
  accentLight: string;
  
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  
  // Sidebar specific
  sidebarBg: string;
  sidebarText: string;
  sidebarBorder: string;
  sidebarAccent: string;
  
  // Card/Panel colors
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  
  // Special
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSmall: string;
  fontSizeLarge: string;
  fontSizeXL: string;
  lineHeight: string;
  fontWeight: string;
  headingWeight: string;
}

export interface ThemeBorders {
  radiusSmall: string;
  radiusMedium: string;
  radiusLarge: string;
  radiusXL: string;
  borderWidth: string;
  borderStyle: string;
}

export interface ThemeShadows {
  small: string;
  medium: string;
  large: string;
  glow: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  borders: ThemeBorders;
  shadows: ThemeShadows;
}

// Default Themes
export const defaultThemes: Theme[] = [
  {
    id: 'classic-gold',
    name: 'זהב קלאסי',
    description: 'ערכת הנושא הקלאסית עם צבעי זהב וכחול כהה',
    isCustom: false,
    colors: {
      primary: '#C9A227',
      primaryHover: '#B8931F',
      primaryLight: '#F5ECD5',
      accent: '#102a43',
      accentHover: '#1a3a57',
      accentLight: '#243B53',
      bgPrimary: '#FFFBEB',
      bgSecondary: '#FEF3C7',
      bgTertiary: '#FFFFFF',
      textPrimary: '#102a43',
      textSecondary: '#486581',
      textMuted: '#829AB1',
      borderPrimary: '#C9A227',
      borderSecondary: '#E5D9B6',
      borderAccent: '#102a43',
      sidebarBg: '#FFFBEB',
      sidebarText: '#102a43',
      sidebarBorder: '#C9A227',
      sidebarAccent: '#C9A227',
      cardBg: '#FFFFFF',
      cardBorder: '#C9A227',
      cardShadow: 'rgba(201, 162, 39, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    typography: {
      fontFamily: 'Frank Ruhl Libre, serif',
      fontSizeBase: '16px',
      fontSizeSmall: '14px',
      fontSizeLarge: '18px',
      fontSizeXL: '24px',
      lineHeight: '1.6',
      fontWeight: '400',
      headingWeight: '700',
    },
    borders: {
      radiusSmall: '8px',
      radiusMedium: '12px',
      radiusLarge: '16px',
      radiusXL: '24px',
      borderWidth: '2px',
      borderStyle: 'solid',
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
      large: '0 8px 24px rgba(0, 0, 0, 0.15)',
      glow: '0 0 20px rgba(201, 162, 39, 0.3)',
    },
  },
  {
    id: 'dark-elegant',
    name: 'חשוך אלגנטי',
    description: 'ערכת נושא כהה עם דגשים זהובים',
    isCustom: false,
    colors: {
      primary: '#D4AF37',
      primaryHover: '#E5C158',
      primaryLight: '#3D3A2F',
      accent: '#8B7355',
      accentHover: '#A68B5B',
      accentLight: '#2D2A23',
      bgPrimary: '#1A1A1A',
      bgSecondary: '#242424',
      bgTertiary: '#2E2E2E',
      textPrimary: '#F5F5F5',
      textSecondary: '#CCCCCC',
      textMuted: '#888888',
      borderPrimary: '#D4AF37',
      borderSecondary: '#444444',
      borderAccent: '#D4AF37',
      sidebarBg: '#1A1A1A',
      sidebarText: '#F5F5F5',
      sidebarBorder: '#D4AF37',
      sidebarAccent: '#D4AF37',
      cardBg: '#242424',
      cardBorder: '#444444',
      cardShadow: 'rgba(0, 0, 0, 0.4)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    typography: {
      fontFamily: 'Frank Ruhl Libre, serif',
      fontSizeBase: '16px',
      fontSizeSmall: '14px',
      fontSizeLarge: '18px',
      fontSizeXL: '24px',
      lineHeight: '1.6',
      fontWeight: '400',
      headingWeight: '700',
    },
    borders: {
      radiusSmall: '8px',
      radiusMedium: '12px',
      radiusLarge: '16px',
      radiusXL: '24px',
      borderWidth: '2px',
      borderStyle: 'solid',
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.2)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.3)',
      large: '0 8px 24px rgba(0, 0, 0, 0.4)',
      glow: '0 0 20px rgba(212, 175, 55, 0.4)',
    },
  },
  {
    id: 'ocean-blue',
    name: 'כחול אוקיינוס',
    description: 'גוונים של כחול ים רגוע ושלו',
    isCustom: false,
    colors: {
      primary: '#0077B6',
      primaryHover: '#006397',
      primaryLight: '#CAF0F8',
      accent: '#023E8A',
      accentHover: '#03478C',
      accentLight: '#0096C7',
      bgPrimary: '#F0F9FF',
      bgSecondary: '#E0F2FE',
      bgTertiary: '#FFFFFF',
      textPrimary: '#023E8A',
      textSecondary: '#0077B6',
      textMuted: '#64748B',
      borderPrimary: '#0077B6',
      borderSecondary: '#BAE6FD',
      borderAccent: '#023E8A',
      sidebarBg: '#F0F9FF',
      sidebarText: '#023E8A',
      sidebarBorder: '#0077B6',
      sidebarAccent: '#0077B6',
      cardBg: '#FFFFFF',
      cardBorder: '#0077B6',
      cardShadow: 'rgba(0, 119, 182, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#0077B6',
    },
    typography: {
      fontFamily: 'Heebo, sans-serif',
      fontSizeBase: '16px',
      fontSizeSmall: '14px',
      fontSizeLarge: '18px',
      fontSizeXL: '24px',
      lineHeight: '1.7',
      fontWeight: '400',
      headingWeight: '600',
    },
    borders: {
      radiusSmall: '6px',
      radiusMedium: '10px',
      radiusLarge: '14px',
      radiusXL: '20px',
      borderWidth: '2px',
      borderStyle: 'solid',
    },
    shadows: {
      small: '0 2px 4px rgba(0, 119, 182, 0.1)',
      medium: '0 4px 12px rgba(0, 119, 182, 0.15)',
      large: '0 8px 24px rgba(0, 119, 182, 0.2)',
      glow: '0 0 20px rgba(0, 119, 182, 0.3)',
    },
  },
  {
    id: 'royal-purple',
    name: 'סגול מלכותי',
    description: 'גוונים מלכותיים של סגול וזהב',
    isCustom: false,
    colors: {
      primary: '#7C3AED',
      primaryHover: '#6D28D9',
      primaryLight: '#EDE9FE',
      accent: '#C9A227',
      accentHover: '#B8931F',
      accentLight: '#FEF3C7',
      bgPrimary: '#FAF5FF',
      bgSecondary: '#F3E8FF',
      bgTertiary: '#FFFFFF',
      textPrimary: '#4C1D95',
      textSecondary: '#6D28D9',
      textMuted: '#A78BFA',
      borderPrimary: '#7C3AED',
      borderSecondary: '#DDD6FE',
      borderAccent: '#C9A227',
      sidebarBg: '#FAF5FF',
      sidebarText: '#4C1D95',
      sidebarBorder: '#7C3AED',
      sidebarAccent: '#C9A227',
      cardBg: '#FFFFFF',
      cardBorder: '#7C3AED',
      cardShadow: 'rgba(124, 58, 237, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#7C3AED',
    },
    typography: {
      fontFamily: 'Frank Ruhl Libre, serif',
      fontSizeBase: '16px',
      fontSizeSmall: '14px',
      fontSizeLarge: '18px',
      fontSizeXL: '24px',
      lineHeight: '1.6',
      fontWeight: '400',
      headingWeight: '700',
    },
    borders: {
      radiusSmall: '10px',
      radiusMedium: '14px',
      radiusLarge: '18px',
      radiusXL: '28px',
      borderWidth: '2px',
      borderStyle: 'solid',
    },
    shadows: {
      small: '0 2px 4px rgba(124, 58, 237, 0.1)',
      medium: '0 4px 12px rgba(124, 58, 237, 0.15)',
      large: '0 8px 24px rgba(124, 58, 237, 0.2)',
      glow: '0 0 20px rgba(124, 58, 237, 0.3)',
    },
  },
  {
    id: 'parchment',
    name: 'קלף עתיק',
    description: 'סגנון קלאסי של כתבי יד עתיקים',
    isCustom: false,
    colors: {
      primary: '#8B4513',
      primaryHover: '#A0522D',
      primaryLight: '#F5DEB3',
      accent: '#2F4F4F',
      accentHover: '#3D6363',
      accentLight: '#708090',
      bgPrimary: '#FDF5E6',
      bgSecondary: '#FAEBD7',
      bgTertiary: '#FFFAF0',
      textPrimary: '#2F2F2F',
      textSecondary: '#4A4A4A',
      textMuted: '#8B8B8B',
      borderPrimary: '#8B4513',
      borderSecondary: '#D2B48C',
      borderAccent: '#2F4F4F',
      sidebarBg: '#FAEBD7',
      sidebarText: '#2F2F2F',
      sidebarBorder: '#8B4513',
      sidebarAccent: '#8B4513',
      cardBg: '#FFFAF0',
      cardBorder: '#D2B48C',
      cardShadow: 'rgba(139, 69, 19, 0.15)',
      success: '#228B22',
      warning: '#DAA520',
      error: '#CD5C5C',
      info: '#4682B4',
    },
    typography: {
      fontFamily: 'David Libre, serif',
      fontSizeBase: '17px',
      fontSizeSmall: '15px',
      fontSizeLarge: '19px',
      fontSizeXL: '26px',
      lineHeight: '1.8',
      fontWeight: '400',
      headingWeight: '700',
    },
    borders: {
      radiusSmall: '4px',
      radiusMedium: '8px',
      radiusLarge: '12px',
      radiusXL: '16px',
      borderWidth: '2px',
      borderStyle: 'solid',
    },
    shadows: {
      small: '0 2px 4px rgba(139, 69, 19, 0.1)',
      medium: '0 4px 12px rgba(139, 69, 19, 0.15)',
      large: '0 8px 24px rgba(139, 69, 19, 0.2)',
      glow: '0 0 15px rgba(139, 69, 19, 0.2)',
    },
  },
];

// Context Interface
interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  addCustomTheme: (theme: Theme) => void;
  updateCustomTheme: (themeId: string, updates: Partial<Theme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  duplicateTheme: (themeId: string, newName: string) => Theme;
  exportTheme: (themeId: string) => string;
  importTheme: (themeJson: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>(() => {
    const saved = localStorage.getItem('custom-themes');
    const customThemes = saved ? JSON.parse(saved) : [];
    return [...defaultThemes, ...customThemes];
  });
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedThemeId = localStorage.getItem('current-theme-id');
    const allThemes = [...defaultThemes];
    const saved = localStorage.getItem('custom-themes');
    if (saved) {
      allThemes.push(...JSON.parse(saved));
    }
    return allThemes.find(t => t.id === savedThemeId) || defaultThemes[0];
  });

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const { colors, typography, borders, shadows } = currentTheme;
    
    // Colors
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-hover', colors.primaryHover);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-hover', colors.accentHover);
    root.style.setProperty('--theme-bg-primary', colors.bgPrimary);
    root.style.setProperty('--theme-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--theme-bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-border-primary', colors.borderPrimary);
    root.style.setProperty('--theme-border-secondary', colors.borderSecondary);
    root.style.setProperty('--theme-sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--theme-sidebar-text', colors.sidebarText);
    root.style.setProperty('--theme-sidebar-border', colors.sidebarBorder);
    root.style.setProperty('--theme-card-bg', colors.cardBg);
    root.style.setProperty('--theme-card-border', colors.cardBorder);
    
    // Typography
    root.style.setProperty('--theme-font-family', typography.fontFamily);
    root.style.setProperty('--theme-font-size-base', typography.fontSizeBase);
    root.style.setProperty('--theme-line-height', typography.lineHeight);
    
    // Borders
    root.style.setProperty('--theme-radius-small', borders.radiusSmall);
    root.style.setProperty('--theme-radius-medium', borders.radiusMedium);
    root.style.setProperty('--theme-radius-large', borders.radiusLarge);
    root.style.setProperty('--theme-border-width', borders.borderWidth);
    
    // Shadows
    root.style.setProperty('--theme-shadow-small', shadows.small);
    root.style.setProperty('--theme-shadow-medium', shadows.medium);
    root.style.setProperty('--theme-shadow-large', shadows.large);
    root.style.setProperty('--theme-shadow-glow', shadows.glow);
    
    localStorage.setItem('current-theme-id', currentTheme.id);
  }, [currentTheme]);

  // Save custom themes
  useEffect(() => {
    const customThemes = themes.filter(t => t.isCustom);
    localStorage.setItem('custom-themes', JSON.stringify(customThemes));
  }, [themes]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const addCustomTheme = (theme: Theme) => {
    setThemes(prev => [...prev, { ...theme, isCustom: true }]);
  };

  const updateCustomTheme = (themeId: string, updates: Partial<Theme>) => {
    setThemes(prev => prev.map(t => 
      t.id === themeId ? { ...t, ...updates } : t
    ));
    if (currentTheme.id === themeId) {
      setCurrentTheme(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteCustomTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.isCustom) {
      setThemes(prev => prev.filter(t => t.id !== themeId));
      if (currentTheme.id === themeId) {
        setCurrentTheme(defaultThemes[0]);
      }
    }
  };

  const duplicateTheme = (themeId: string, newName: string): Theme => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return defaultThemes[0];
    
    const newTheme: Theme = {
      ...JSON.parse(JSON.stringify(theme)),
      id: `custom-${Date.now()}`,
      name: newName,
      isCustom: true,
    };
    addCustomTheme(newTheme);
    return newTheme;
  };

  const exportTheme = (themeId: string): string => {
    const theme = themes.find(t => t.id === themeId);
    return theme ? JSON.stringify(theme, null, 2) : '';
  };

  const importTheme = (themeJson: string): boolean => {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      theme.id = `imported-${Date.now()}`;
      theme.isCustom = true;
      addCustomTheme(theme);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      setTheme,
      addCustomTheme,
      updateCustomTheme,
      deleteCustomTheme,
      duplicateTheme,
      exportTheme,
      importTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
