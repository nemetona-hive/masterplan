/**
 * THEME DEFINITIONS
 * ─────────────────────────────────────────────────────────────
 * Define all themes here. Each theme is a map of CSS variable names
 * to color values. These are applied dynamically via document.documentElement.
 * 
 * To add a new theme:
 * 1. Add a new object below with a unique key
 * 2. Include all color variables you want to override
 * 3. The theme will automatically be available in the toggle button
 */

const THEMES = {
  navi: {
    name: 'navi',
    label: 'Navi',
    icon: '◇',
    colors: {
      '--color-darkblue':       '#09101a',
      '--color-darkblue-light': '#131923',
      '--color-gray':           '#506070',
      '--color-gray-light':     '#233342',
      '--color-gray-opa80':     '#73808d',
      '--color-blue':           '#3d7a9e',
      '--color-white':          '#fff',
    },
  },
};

/**
 * Get ordered list of theme names
 */
const getThemeOrder = () => Object.keys(THEMES);

/**
 * Apply theme by name
 */
const applyTheme = (themeName) => {
  const theme = THEMES[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found. Available themes:`, getThemeOrder());
    return;
  }
  
  // Apply colors to CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Store current theme for reference
  document.documentElement.setAttribute('data-theme', themeName);
};
