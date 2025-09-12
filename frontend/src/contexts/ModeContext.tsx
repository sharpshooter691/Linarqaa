import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export type AppMode = 'kindergarten' | 'extra-courses';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  sidebar: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

export interface ThemeConfig {
  kindergarten: ThemeColors;
  'extra-courses': ThemeColors;
}

export interface SavedTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  mode: AppMode;
  createdAt: string;
}

const defaultThemes: ThemeConfig = {
  kindergarten: {
    primary: '#f59e0b', // amber-500
    secondary: '#f97316', // orange-500
    accent: '#eab308', // yellow-500
    background: '#fefce8', // yellow-50
    surface: '#ffffff',
    sidebar: '#fef3c7', // yellow-100
    card: '#ffffff',
    text: '#1f2937', // gray-800
    textSecondary: '#6b7280', // gray-500
    border: '#fde68a', // amber-200
    shadow: '#fbbf24', // amber-400
  },
  'extra-courses': {
    primary: '#3b82f6', // blue-500
    secondary: '#6366f1', // indigo-500
    accent: '#8b5cf6', // violet-500
    background: '#f8fafc', // slate-50
    surface: '#ffffff',
    sidebar: '#e2e8f0', // slate-200
    card: '#ffffff',
    text: '#1f2937', // gray-800
    textSecondary: '#6b7280', // gray-500
    border: '#cbd5e1', // slate-300
    shadow: '#64748b', // slate-500
  }
};

// Extended color palette
export const colorPalette: string[] = [
  '#ef4444', '#dc2626', '#b91c1c',
  '#f97316', '#ea580c', '#c2410c',
  '#f59e0b', '#d97706', '#b45309',
  '#eab308', '#ca8a04', '#a16207',
  '#22c55e', '#16a34a', '#15803d',
  '#10b981', '#059669', '#047857',
  '#14b8a6', '#0d9488', '#0f766e',
  '#06b6d4', '#0891b2', '#0e7490',
  '#3b82f6', '#2563eb', '#1d4ed8',
  '#6366f1', '#4f46e5', '#4338ca',
  '#8b5cf6', '#7c3aed', '#6d28d9',
  '#a855f7', '#9333ea', '#7e22ce',
  '#d946ef', '#c026d3', '#a21caf',
  '#ec4899', '#db2777', '#be185d',
  '#f43f5e', '#e11d48', '#be123c',
  '#64748b', '#475569', '#334155',
  '#6b7280', '#4b5563', '#374151',
  '#71717a', '#52525b', '#3f3f46',
  '#78716c', '#57534e', '#44403c',
  '#0ea5e9', '#0284c7', '#0369a1',
  '#84cc16', '#65a30d', '#4d7c0f',
  '#00d4aa', '#00b894', '#00a085',
  '#ff6b6b', '#ff5252', '#e53935',
  '#b19cd9', '#9c7cd6', '#8e6dd3',
  '#ffb347', '#ffa726', '#ff9800',
  '#98fb98', '#90ee90', '#7ccd7c',
  '#b0e0e6', '#87ceeb', '#5dade2',
  '#fa8072', '#f08080', '#e9967a',
  '#ffd700', '#ffc107', '#ffb300',
  '#c0c0c0', '#a8a8a8', '#909090',
  '#cd7f32', '#b8860b', '#a0522d',
  '#b87333', '#a0522d', '#8b4513',
  '#40e0d0', '#00ced1', '#20b2aa',
  '#ff00ff', '#e600e6', '#cc00cc',
  '#000080', '#191970', '#0000cd',
  '#228b22', '#006400', '#32cd32',
  '#dc143c', '#b22222', '#8b0000',
  '#d2691e', '#cd853f', '#daa520',
  '#fffff0', '#f5f5dc', '#f0e68c',
  '#fffdd0', '#f5deb3', '#deb887',
  '#f5f5dc', '#f0e68c', '#daa520',
  '#d2b48c', '#bc9a6a', '#a67c52',
  '#f0e68c', '#bdb76b', '#9acd32',
  '#808000', '#6b8e23', '#556b2f',
  '#800000', '#8b0000', '#a0522d',
  '#800020', '#722f37', '#4a0e0e',
  '#722f37', '#4a0e0e', '#2c0e0e',
  '#dda0dd', '#da70d6', '#ba55d3',
  '#da70d6', '#ba55d3', '#9932cc',
  '#8a2be2', '#7b68ee', '#6a5acd',
  '#4b0082', '#483d8b', '#4169e1',
  '#4169e1', '#0000ff', '#0000cd',
  '#0047ab', '#1e90ff', '#00bfff',
  '#4682b4', '#5f9ea0', '#708090',
  '#708090', '#696969', '#2f4f4f',
  '#36454f', '#2f4f4f', '#1c1c1c',
  '#343434', '#2f2f2f', '#1a1a1a',
  '#0f0f0f', '#1a1a1a', '#2f2f2f',
  '#f8f8ff', '#f0f8ff', '#e6e6fa',
  '#fffff0', '#fff8dc', '#f5f5dc',
  '#fffafa', '#f0f8ff', '#f5f5f5',
  '#f8f8ff', '#f0f0f0', '#e8e8e8',
  '#ffffff', '#f8f8f8', '#f0f0f0',
  '#000000', '#1a1a1a', '#2f2f2f'
];

// Predefined themes with enhanced card interactions
export const predefinedThemes: Record<string, ThemeConfig> = {
  'Sunshine Kids': {
    kindergarten: {
      primary: '#f59e0b', secondary: '#f97316', accent: '#eab308',
      background: '#fefce8', surface: '#ffffff', sidebar: '#fef3c7',
      card: '#fff8e1', text: '#1f2937', textSecondary: '#6b7280',
      border: '#fde68a', shadow: '#fbbf24'
    },
    'extra-courses': {
      primary: '#3b82f6', secondary: '#6366f1', accent: '#8b5cf6',
      background: '#f8fafc', surface: '#ffffff', sidebar: '#e2e8f0',
      card: '#f1f5f9', text: '#1f2937', textSecondary: '#6b7280',
      border: '#cbd5e1', shadow: '#64748b'
    }
  },
  'Ocean Breeze': {
    kindergarten: {
      primary: '#06b6d4', secondary: '#0891b2', accent: '#14b8a6',
      background: '#f0fdfa', surface: '#ffffff', sidebar: '#ccfbf1',
      card: '#ecfeff', text: '#0f172a', textSecondary: '#475569',
      border: '#99f6e4', shadow: '#22d3ee'
    },
    'extra-courses': {
      primary: '#0ea5e9', secondary: '#0284c7', accent: '#0369a1',
      background: '#f0f9ff', surface: '#ffffff', sidebar: '#e0f2fe',
      card: '#f8fafc', text: '#0f172a', textSecondary: '#475569',
      border: '#7dd3fc', shadow: '#0ea5e9'
    }
  },
  'Forest Green': {
    kindergarten: {
      primary: '#22c55e', secondary: '#16a34a', accent: '#10b981',
      background: '#f0fdf4', surface: '#ffffff', sidebar: '#dcfce7',
      card: '#f0fdf4', text: '#14532d', textSecondary: '#365314',
      border: '#bbf7d0', shadow: '#22c55e'
    },
    'extra-courses': {
      primary: '#059669', secondary: '#047857', accent: '#065f46',
      background: '#ecfdf5', surface: '#ffffff', sidebar: '#d1fae5',
      card: '#f0fdf4', text: '#064e3b', textSecondary: '#065f46',
      border: '#a7f3d0', shadow: '#059669'
    }
  },
  'Royal Purple': {
    kindergarten: {
      primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7',
      background: '#faf5ff', surface: '#ffffff', sidebar: '#f3e8ff',
      card: '#faf5ff', text: '#581c87', textSecondary: '#7c2d12',
      border: '#e9d5ff', shadow: '#8b5cf6'
    },
    'extra-courses': {
      primary: '#6366f1', secondary: '#4f46e5', accent: '#4338ca',
      background: '#eef2ff', surface: '#ffffff', sidebar: '#e0e7ff',
      card: '#f8fafc', text: '#312e81', textSecondary: '#4338ca',
      border: '#c7d2fe', shadow: '#6366f1'
    }
  },
  'Sunset Orange': {
    kindergarten: {
      primary: '#f97316', secondary: '#ea580c', accent: '#f59e0b',
      background: '#fff7ed', surface: '#ffffff', sidebar: '#fed7aa',
      card: '#fff7ed', text: '#9a3412', textSecondary: '#c2410c',
      border: '#fdba74', shadow: '#f97316'
    },
    'extra-courses': {
      primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444',
      background: '#fef2f2', surface: '#ffffff', sidebar: '#fecaca',
      card: '#fef2f2', text: '#991b1b', textSecondary: '#dc2626',
      border: '#fca5a5', shadow: '#dc2626'
    }
  },
  'Midnight Blue': {
    kindergarten: {
      primary: '#1e40af', secondary: '#1d4ed8', accent: '#2563eb',
      background: '#eff6ff', surface: '#ffffff', sidebar: '#dbeafe',
      card: '#eff6ff', text: '#1e3a8a', textSecondary: '#1d4ed8',
      border: '#bfdbfe', shadow: '#1e40af'
    },
    'extra-courses': {
      primary: '#1e293b', secondary: '#334155', accent: '#475569',
      background: '#f1f5f9', surface: '#ffffff', sidebar: '#e2e8f0',
      card: '#f8fafc', text: '#0f172a', textSecondary: '#334155',
      border: '#cbd5e1', shadow: '#1e293b'
    }
  },
  'Rose Gold': {
    kindergarten: {
      primary: '#f43f5e', secondary: '#e11d48', accent: '#ec4899',
      background: '#fff1f2', surface: '#ffffff', sidebar: '#ffe4e6',
      card: '#fff1f2', text: '#be123c', textSecondary: '#e11d48',
      border: '#fecdd3', shadow: '#f43f5e'
    },
    'extra-courses': {
      primary: '#d946ef', secondary: '#c026d3', accent: '#a855f7',
      background: '#faf5ff', surface: '#ffffff', sidebar: '#f3e8ff',
      card: '#faf5ff', text: '#86198f', textSecondary: '#c026d3',
      border: '#e9d5ff', shadow: '#d946ef'
    }
  },
  'Emerald Dream': {
    kindergarten: {
      primary: '#10b981', secondary: '#059669', accent: '#22c55e',
      background: '#ecfdf5', surface: '#ffffff', sidebar: '#d1fae5',
      card: '#ecfdf5', text: '#064e3b', textSecondary: '#059669',
      border: '#a7f3d0', shadow: '#10b981'
    },
    'extra-courses': {
      primary: '#14b8a6', secondary: '#0d9488', accent: '#06b6d4',
      background: '#f0fdfa', surface: '#ffffff', sidebar: '#ccfbf1',
      card: '#f0fdfa', text: '#134e4a', textSecondary: '#0d9488',
      border: '#99f6e4', shadow: '#14b8a6'
    }
  },
  // NEW MODERN THEMES INSPIRED BY 2024/2025 TRENDS
  'Glassmorphism': {
    kindergarten: {
      primary: '#667eea', secondary: '#764ba2', accent: '#f093fb',
      background: 'rgba(255,255,255,0.1)', surface: 'rgba(255,255,255,0.2)', sidebar: 'rgba(255,255,255,0.15)',
      card: 'rgba(255,255,255,0.25)', text: '#1a202c', textSecondary: '#4a5568',
      border: 'rgba(255,255,255,0.3)', shadow: 'rgba(0,0,0,0.1)'
    },
    'extra-courses': {
      primary: '#4facfe', secondary: '#00f2fe', accent: '#43e97b',
      background: 'rgba(0,0,0,0.1)', surface: 'rgba(255,255,255,0.1)', sidebar: 'rgba(0,0,0,0.15)',
      card: 'rgba(255,255,255,0.2)', text: '#ffffff', textSecondary: '#e2e8f0',
      border: 'rgba(255,255,255,0.2)', shadow: 'rgba(0,0,0,0.2)'
    }
  },
  'Neumorphism': {
    kindergarten: {
      primary: '#e0e5ec', secondary: '#d1d9e6', accent: '#f0f0f3',
      background: '#e0e5ec', surface: '#e0e5ec', sidebar: '#d1d9e6',
      card: '#e0e5ec', text: '#4a5568', textSecondary: '#718096',
      border: '#cbd5e0', shadow: '#a0aec0'
    },
    'extra-courses': {
      primary: '#2d3748', secondary: '#4a5568', accent: '#718096',
      background: '#2d3748', surface: '#2d3748', sidebar: '#4a5568',
      card: '#2d3748', text: '#e2e8f0', textSecondary: '#cbd5e0',
      border: '#4a5568', shadow: '#1a202c'
    }
  },
  'Dark Mode Pro': {
    kindergarten: {
      primary: '#ff6b6b', secondary: '#4ecdc4', accent: '#45b7d1',
      background: '#1a1a1a', surface: '#2d2d2d', sidebar: '#1a1a1a',
      card: '#2d2d2d', text: '#ffffff', textSecondary: '#b0b0b0',
      border: '#404040', shadow: '#000000'
    },
    'extra-courses': {
      primary: '#6c5ce7', secondary: '#a29bfe', accent: '#fd79a8',
      background: '#0d1117', surface: '#161b22', sidebar: '#0d1117',
      card: '#161b22', text: '#f0f6fc', textSecondary: '#8b949e',
      border: '#30363d', shadow: '#000000'
    }
  },
  'Minimalist White': {
    kindergarten: {
      primary: '#000000', secondary: '#333333', accent: '#666666',
      background: '#fafafa', surface: '#ffffff', sidebar: '#f5f5f5',
      card: '#ffffff', text: '#000000', textSecondary: '#666666',
      border: '#e5e5e5', shadow: '#000000'
    },
    'extra-courses': {
      primary: '#2563eb', secondary: '#1d4ed8', accent: '#3b82f6',
      background: '#ffffff', surface: '#ffffff', sidebar: '#f8fafc',
      card: '#ffffff', text: '#111827', textSecondary: '#6b7280',
      border: '#e5e7eb', shadow: '#000000'
    }
  },
  'Warm Neutrals': {
    kindergarten: {
      primary: '#d4af37', secondary: '#b8860b', accent: '#daa520',
      background: '#fdf6e3', surface: '#ffffff', sidebar: '#f5f0e8',
      card: '#fdf6e3', text: '#8b4513', textSecondary: '#a0522d',
      border: '#deb887', shadow: '#d4af37'
    },
    'extra-courses': {
      primary: '#8b4513', secondary: '#a0522d', accent: '#cd853f',
      background: '#f5f5dc', surface: '#ffffff', sidebar: '#f0e68c',
      card: '#f5f5dc', text: '#654321', textSecondary: '#8b4513',
      border: '#daa520', shadow: '#8b4513'
    }
  },
  'Cyberpunk': {
    kindergarten: {
      primary: '#00ff88', secondary: '#ff0080', accent: '#00ffff',
      background: '#0a0a0a', surface: '#1a1a1a', sidebar: '#0a0a0a',
      card: '#1a1a1a', text: '#00ff88', textSecondary: '#80ff80',
      border: '#00ff88', shadow: '#00ff88'
    },
    'extra-courses': {
      primary: '#ff0080', secondary: '#00ffff', accent: '#ffff00',
      background: '#000000', surface: '#111111', sidebar: '#000000',
      card: '#111111', text: '#ff0080', textSecondary: '#ff80ff',
      border: '#ff0080', shadow: '#ff0080'
    }
  },
  'Pastel Dreams': {
    kindergarten: {
      primary: '#ff9a9e', secondary: '#fecfef', accent: '#fecfef',
      background: '#fef7f7', surface: '#ffffff', sidebar: '#fef0f0',
      card: '#fef7f7', text: '#8b5a5a', textSecondary: '#a67c7c',
      border: '#f5c6cb', shadow: '#ff9a9e'
    },
    'extra-courses': {
      primary: '#a8edea', secondary: '#fed6e3', accent: '#d299c2',
      background: '#f0f8ff', surface: '#ffffff', sidebar: '#e6f3ff',
      card: '#f0f8ff', text: '#4a5568', textSecondary: '#718096',
      border: '#bee3f8', shadow: '#a8edea'
    }
  },
  'Material You': {
    kindergarten: {
      primary: '#6750a4', secondary: '#625b71', accent: '#7d5260',
      background: '#fffbfe', surface: '#ffffff', sidebar: '#f3edf7',
      card: '#fffbfe', text: '#1c1b1f', textSecondary: '#49454f',
      border: '#cac4d0', shadow: '#6750a4'
    },
    'extra-courses': {
      primary: '#6750a4', secondary: '#625b71', accent: '#7d5260',
      background: '#141218', surface: '#1d1b20', sidebar: '#141218',
      card: '#1d1b20', text: '#e6e0e9', textSecondary: '#cac4d0',
      border: '#938f99', shadow: '#6750a4'
    }
  },
  'Nordic Winter': {
    kindergarten: {
      primary: '#5e81ac', secondary: '#81a1c1', accent: '#88c0d0',
      background: '#eceff4', surface: '#ffffff', sidebar: '#e5e9f0',
      card: '#eceff4', text: '#2e3440', textSecondary: '#4c566a',
      border: '#d8dee9', shadow: '#5e81ac'
    },
    'extra-courses': {
      primary: '#2e3440', secondary: '#3b4252', accent: '#434c5e',
      background: '#2e3440', surface: '#3b4252', sidebar: '#2e3440',
      card: '#3b4252', text: '#d8dee9', textSecondary: '#e5e9f0',
      border: '#4c566a', shadow: '#2e3440'
    }
  },
  'Retro Wave': {
    kindergarten: {
      primary: '#ff6b9d', secondary: '#c44569', accent: '#f8b500',
      background: '#2c2c54', surface: '#40407a', sidebar: '#2c2c54',
      card: '#40407a', text: '#ffffff', textSecondary: '#e0e0e0',
      border: '#706fd3', shadow: '#ff6b9d'
    },
    'extra-courses': {
      primary: '#ff6b9d', secondary: '#c44569', accent: '#f8b500',
      background: '#1a1a2e', surface: '#16213e', sidebar: '#1a1a2e',
      card: '#16213e', text: '#ffffff', textSecondary: '#e0e0e0',
      border: '#0f3460', shadow: '#ff6b9d'
    }
  },
  'Nature Fresh': {
    kindergarten: {
      primary: '#2d5016', secondary: '#4a7c59', accent: '#6b8e23',
      background: '#f0f8e8', surface: '#ffffff', sidebar: '#e8f5e8',
      card: '#f0f8e8', text: '#2d5016', textSecondary: '#4a7c59',
      border: '#c8e6c9', shadow: '#2d5016'
    },
    'extra-courses': {
      primary: '#1b5e20', secondary: '#2e7d32', accent: '#388e3c',
      background: '#e8f5e8', surface: '#ffffff', sidebar: '#c8e6c9',
      card: '#e8f5e8', text: '#1b5e20', textSecondary: '#2e7d32',
      border: '#a5d6a7', shadow: '#1b5e20'
    }
  },
  'Sunset Gradient': {
    kindergarten: {
      primary: '#ff7e5f', secondary: '#feb47b', accent: '#ff6b6b',
      background: '#fff5f5', surface: '#ffffff', sidebar: '#ffe8e8',
      card: '#fff5f5', text: '#8b4513', textSecondary: '#cd853f',
      border: '#ffb3ba', shadow: '#ff7e5f'
    },
    'extra-courses': {
      primary: '#ff416c', secondary: '#ff4b2b', accent: '#ff6b6b',
      background: '#ffeaa7', surface: '#ffffff', sidebar: '#fdcb6e',
      card: '#ffeaa7', text: '#2d3436', textSecondary: '#636e72',
      border: '#fab1a0', shadow: '#ff416c'
    }
  },
  'Monochrome': {
    kindergarten: {
      primary: '#000000', secondary: '#333333', accent: '#666666',
      background: '#f8f8f8', surface: '#ffffff', sidebar: '#f0f0f0',
      card: '#f8f8f8', text: '#000000', textSecondary: '#666666',
      border: '#e0e0e0', shadow: '#000000'
    },
    'extra-courses': {
      primary: '#ffffff', secondary: '#e0e0e0', accent: '#c0c0c0',
      background: '#000000', surface: '#1a1a1a', sidebar: '#000000',
      card: '#1a1a1a', text: '#ffffff', textSecondary: '#c0c0c0',
      border: '#333333', shadow: '#ffffff'
    }
  },
  'Ocean Depths': {
    kindergarten: {
      primary: '#006064', secondary: '#00838f', accent: '#00acc1',
      background: '#e0f2f1', surface: '#ffffff', sidebar: '#b2dfdb',
      card: '#e0f2f1', text: '#004d40', textSecondary: '#00695c',
      border: '#80cbc4', shadow: '#006064'
    },
    'extra-courses': {
      primary: '#004d40', secondary: '#00695c', accent: '#00796b',
      background: '#004d40', surface: '#00695c', sidebar: '#004d40',
      card: '#00695c', text: '#e0f2f1', textSecondary: '#b2dfdb',
      border: '#00838f', shadow: '#004d40'
    }
  },
  'Cosmic Purple': {
    kindergarten: {
      primary: '#6a1b9a', secondary: '#8e24aa', accent: '#ab47bc',
      background: '#f3e5f5', surface: '#ffffff', sidebar: '#e1bee7',
      card: '#f3e5f5', text: '#4a148c', textSecondary: '#6a1b9a',
      border: '#ce93d8', shadow: '#6a1b9a'
    },
    'extra-courses': {
      primary: '#4a148c', secondary: '#6a1b9a', accent: '#8e24aa',
      background: '#4a148c', surface: '#6a1b9a', sidebar: '#4a148c',
      card: '#6a1b9a', text: '#e1bee7', textSecondary: '#ce93d8',
      border: '#ab47bc', shadow: '#4a148c'
    }
  },
  'Fire & Ice': {
    kindergarten: {
      primary: '#ff5722', secondary: '#ff9800', accent: '#ffc107',
      background: '#fff3e0', surface: '#ffffff', sidebar: '#ffe0b2',
      card: '#fff3e0', text: '#e65100', textSecondary: '#ff8f00',
      border: '#ffcc02', shadow: '#ff5722'
    },
    'extra-courses': {
      primary: '#2196f3', secondary: '#03a9f4', accent: '#00bcd4',
      background: '#e3f2fd', surface: '#ffffff', sidebar: '#bbdefb',
      card: '#e3f2fd', text: '#0d47a1', textSecondary: '#1565c0',
      border: '#90caf9', shadow: '#2196f3'
    }
  },
  'Zen Garden': {
    kindergarten: {
      primary: '#795548', secondary: '#8d6e63', accent: '#a1887f',
      background: '#fafafa', surface: '#ffffff', sidebar: '#f5f5f5',
      card: '#fafafa', text: '#3e2723', textSecondary: '#5d4037',
      border: '#d7ccc8', shadow: '#795548'
    },
    'extra-courses': {
      primary: '#3e2723', secondary: '#5d4037', accent: '#6d4c41',
      background: '#efebe9', surface: '#ffffff', sidebar: '#d7ccc8',
      card: '#efebe9', text: '#3e2723', textSecondary: '#5d4037',
      border: '#a1887f', shadow: '#3e2723'
    }
  }
};

interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
  themes: ThemeConfig;
  updateTheme: (mode: AppMode, colors: Partial<ThemeColors>) => void;
  resetTheme: (mode: AppMode) => void;
  getCurrentTheme: () => ThemeColors;
  savedThemes: SavedTheme[];
  saveTheme: (name: string, colors: ThemeColors) => void;
  loadTheme: (themeId: string) => void;
  deleteTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => void;
  importTheme: (themeData: SavedTheme) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    const savedMode = localStorage.getItem('app-mode');
    return (savedMode as AppMode) || 'kindergarten';
  });
  
  const [themes, setThemes] = useState<ThemeConfig>(() => {
    const savedThemes = localStorage.getItem('app-themes');
    if (savedThemes) {
      try {
        return { ...defaultThemes, ...JSON.parse(savedThemes) };
      } catch {
        return defaultThemes;
      }
    }
    return defaultThemes;
  });

  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    const saved = localStorage.getItem('saved-themes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const { toast } = useToast();

  // Apply theme variables globally to CSS root
  const applyThemeGlobally = (theme: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--mode-primary', theme.primary);
    root.style.setProperty('--mode-secondary', theme.secondary);
    root.style.setProperty('--mode-accent', theme.accent);
    root.style.setProperty('--mode-background', theme.background);
    root.style.setProperty('--mode-surface', theme.surface);
    root.style.setProperty('--mode-sidebar', theme.sidebar);
    root.style.setProperty('--mode-card', theme.card);
    root.style.setProperty('--mode-text', theme.text);
    root.style.setProperty('--mode-textSecondary', theme.textSecondary);
    root.style.setProperty('--mode-border', theme.border);
    root.style.setProperty('--mode-shadow', theme.shadow);
  };

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app-mode', newMode);
    
    // Apply theme immediately
    applyThemeGlobally(themes[newMode]);
    
    const message = newMode === 'kindergarten' 
      ? 'Switched to Linarqa Kids 🎉' 
      : 'Switched to Linarqa Academy 📚';
    toast({
      title: message,
      description: newMode === 'kindergarten' 
        ? 'Welcome to the bright and cheerful kindergarten interface!' 
        : 'Welcome to the professional academic interface!',
      variant: 'default',
    });
  };

  const toggleMode = () => {
    const newMode = mode === 'kindergarten' ? 'extra-courses' : 'kindergarten';
    setMode(newMode);
  };

  const updateTheme = (targetMode: AppMode, colors: Partial<ThemeColors>) => {
    setThemes(prev => {
      const updated = {
        ...prev,
        [targetMode]: { ...prev[targetMode], ...colors }
      };
      localStorage.setItem('app-themes', JSON.stringify(updated));
      
      // Apply theme immediately if it's the current mode
      if (targetMode === mode) {
        applyThemeGlobally(updated[targetMode]);
      }
      
      return updated;
    });
  };

  const resetTheme = (targetMode: AppMode) => {
    setThemes(prev => {
      const updated = {
        ...prev,
        [targetMode]: defaultThemes[targetMode]
      };
      localStorage.setItem('app-themes', JSON.stringify(updated));
      
      // Apply theme immediately if it's the current mode
      if (targetMode === mode) {
        applyThemeGlobally(updated[targetMode]);
      }
      
      return updated;
    });
    
    toast({
      title: "Theme Reset",
      description: `${targetMode === 'kindergarten' ? 'Linarqa Kids' : 'Linarqa Academy'} theme has been reset to default!`,
    });
  };

  const getCurrentTheme = () => themes[mode];

  const saveTheme = (name: string, colors: ThemeColors) => {
    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name,
      colors,
      mode,
      createdAt: new Date().toISOString(),
    };
    
    setSavedThemes(prev => {
      const updated = [...prev, newTheme];
      localStorage.setItem('saved-themes', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Theme Saved",
      description: `"${name}" has been saved successfully!`,
    });
  };

  const loadTheme = (themeId: string) => {
    const theme = savedThemes.find(t => t.id === themeId);
    if (theme) {
      updateTheme(theme.mode, theme.colors);
      toast({
        title: "Theme Loaded",
        description: `"${theme.name}" has been applied!`,
      });
    }
  };

  const deleteTheme = (themeId: string) => {
    setSavedThemes(prev => {
      const updated = prev.filter(t => t.id !== themeId);
      localStorage.setItem('saved-themes', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Theme Deleted",
      description: "Theme has been removed from your collection.",
    });
  };

  const exportTheme = (themeId: string) => {
    const theme = savedThemes.find(t => t.id === themeId);
    if (theme) {
      const dataStr = JSON.stringify(theme, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${theme.name.replace(/\s+/g, '_')}_theme.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Theme Exported",
        description: `"${theme.name}" has been exported successfully!`,
      });
    }
  };

  const importTheme = (themeData: SavedTheme) => {
    setSavedThemes(prev => {
      const updated = [...prev, themeData];
      localStorage.setItem('saved-themes', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Theme Imported",
      description: `"${themeData.name}" has been imported successfully!`,
    });
  };

  // Apply theme on mount and when mode changes
  useEffect(() => {
    applyThemeGlobally(themes[mode]);
  }, [mode, themes]);

  // Update document class for global styling
  useEffect(() => {
    document.documentElement.classList.remove('mode-kindergarten', 'mode-extra-courses');
    document.documentElement.classList.add(`mode-${mode}`);
  }, [mode]);

  const value = {
    mode,
    toggleMode,
    setMode,
    themes,
    updateTheme,
    resetTheme,
    getCurrentTheme,
    savedThemes,
    saveTheme,
    loadTheme,
    deleteTheme,
    exportTheme,
    importTheme,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}; 