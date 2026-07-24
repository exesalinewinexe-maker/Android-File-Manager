// Android File Manager - Theme System

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: {
        name: 'Light',
        primaryColor: '#2196F3',
        primaryDark: '#1976D2',
        primaryLight: '#BBDEFB',
        accentColor: '#FF9800',
        dangerColor: '#F44336',
        successColor: '#4CAF50',
        warningColor: '#FFC107',
        textPrimary: '#212121',
        textSecondary: '#757575',
        dividerColor: '#BDBDBD',
        backgroundColor: '#FAFAFA',
        surfaceColor: '#FFFFFF'
      },
      dark: {
        name: 'Dark',
        primaryColor: '#1E88E5',
        primaryDark: '#1565C0',
        primaryLight: '#42A5F5',
        accentColor: '#FF9800',
        dangerColor: '#EF5350',
        successColor: '#66BB6A',
        warningColor: '#FDD835',
        textPrimary: '#FFFFFF',
        textSecondary: '#BDBDBD',
        dividerColor: '#424242',
        backgroundColor: '#121212',
        surfaceColor: '#1E1E1E'
      },
      ocean: {
        name: 'Ocean',
        primaryColor: '#006064',
        primaryDark: '#00363A',
        primaryLight: '#4DD0E1',
        accentColor: '#FF6F00',
        dangerColor: '#D32F2F',
        successColor: '#388E3C',
        warningColor: '#F57F17',
        textPrimary: '#263238',
        textSecondary: '#546E7A',
        dividerColor: '#B0BEC5',
        backgroundColor: '#E0F2F1',
        surfaceColor: '#FFFFFF'
      },
      forest: {
        name: 'Forest',
        primaryColor: '#1B5E20',
        primaryDark: '#003300',
        primaryLight: '#4CAF50',
        accentColor: '#FF6E40',
        dangerColor: '#C62828',
        successColor: '#2E7D32',
        warningColor: '#F57F17',
        textPrimary: '#1B5E20',
        textSecondary: '#558B2F',
        dividerColor: '#9CCC65',
        backgroundColor: '#F1F8E9',
        surfaceColor: '#FFFFFF'
      },
      sunset: {
        name: 'Sunset',
        primaryColor: '#D32F2F',
        primaryDark: '#B71C1C',
        primaryLight: '#EF9A9A',
        accentColor: '#FF6F00',
        dangerColor: '#C62828',
        successColor: '#F57C00',
        warningColor: '#FFB300',
        textPrimary: '#BF360C',
        textSecondary: '#E64A19',
        dividerColor: '#FFAB91',
        backgroundColor: '#FFEBEE',
        surfaceColor: '#FFFFFF'
      },
      midnight: {
        name: 'Midnight',
        primaryColor: '#0D47A1',
        primaryDark: '#0D47A1',
        primaryLight: '#90CAF9',
        accentColor: '#FFD600',
        dangerColor: '#B71C1C',
        successColor: '#1B5E20',
        warningColor: '#F57F17',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0BEC5',
        dividerColor: '#37474F',
        backgroundColor: '#0A0E27',
        surfaceColor: '#1A1F3A'
      }
    };
    this.init();
  }

  init() {
    this.loadTheme();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for system theme preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Load theme from localStorage
   */
  loadTheme() {
    const saved = localStorage.getItem('fileManagerTheme');
    if (saved && this.themes[saved]) {
      this.setTheme(saved);
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Set theme
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }

    this.currentTheme = themeName;
    this.applyTheme(themeName);
    localStorage.setItem('fileManagerTheme', themeName);
  }

  /**
   * Apply theme to DOM
   */
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'name') {
        const varName = `--${this.camelToKebab(key)}`;
        root.style.setProperty(varName, value);
      }
    });

    document.body.setAttribute('data-theme', themeName);
  }

  /**
   * Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name
    }));
  }

  /**
   * Toggle between light and dark
   */
  toggleDarkMode() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  /**
   * Create custom theme
   */
  createCustomTheme(themeName, colors) {
    const requiredKeys = [
      'primaryColor', 'primaryDark', 'primaryLight',
      'accentColor', 'dangerColor', 'successColor',
      'warningColor', 'textPrimary', 'textSecondary',
      'dividerColor', 'backgroundColor', 'surfaceColor'
    ];

    for (let key of requiredKeys) {
      if (!colors[key]) {
        console.error(`Missing required color: ${key}`);
        return false;
      }
    }

    this.themes[themeName] = {
      name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
      ...colors
    };

    return true;
  }

  /**
   * Delete custom theme
   */
  deleteCustomTheme(themeName) {
    if (['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'].includes(themeName)) {
      console.error('Cannot delete built-in themes');
      return false;
    }

    delete this.themes[themeName];
    
    if (this.currentTheme === themeName) {
      this.setTheme('light');
    }

    return true;
  }

  /**
   * Export theme as JSON
   */
  exportTheme(themeName) {
    if (!this.themes[themeName]) {
      return null;
    }
    return JSON.stringify(this.themes[themeName], null, 2);
  }

  /**
   * Import theme from JSON
   */
  importTheme(themeName, jsonString) {
    try {
      const theme = JSON.parse(jsonString);
      return this.createCustomTheme(themeName, theme);
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  /**
   * Get theme colors
   */
  getThemeColors(themeName = null) {
    const theme = themeName ? this.themes[themeName] : this.getCurrentTheme();
    return theme ? { ...theme } : null;
  }

  /**
   * Update theme color
   */
  updateThemeColor(colorKey, colorValue) {
    const theme = this.getCurrentTheme();
    if (theme && theme.hasOwnProperty(colorKey)) {
      theme[colorKey] = colorValue;
      this.applyTheme(this.currentTheme);
      return true;
    }
    return false;
  }

  /**
   * Enable accessibility theme
   */
  enableAccessibilityMode(enable = true) {
    if (enable) {
      document.body.setAttribute('data-accessibility', 'true');
      localStorage.setItem('fileManagerAccessibility', 'true');
    } else {
      document.body.removeAttribute('data-accessibility');
      localStorage.setItem('fileManagerAccessibility', 'false');
    }
  }

  /**
   * Check if accessibility mode is enabled
   */
  isAccessibilityModeEnabled() {
    return localStorage.getItem('fileManagerAccessibility') === 'true';
  }

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate luminance of a color
   */
  getLuminance(color) {
    const rgb = this.hexToRgb(color);
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  /**
   * Validate color
   */
  isValidColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}

// Export theme manager instance
const themeManager = new ThemeManager();
