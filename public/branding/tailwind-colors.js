/**
 * TownApp Brand Colors - Tailwind CSS Configuration
 *
 * Usage:
 * 1. Import in tailwind.config.js
 * 2. Add to theme.extend.colors
 *
 * Example:
 * const townappColors = require('./public/branding/tailwind-colors.js');
 *
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: townappColors,
 *     }
 *   }
 * }
 */

module.exports = {
  // Brand colors
  brand: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Primary brand color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',  // Logo stroke
      900: '#1e3a8a',
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',  // Dark mode logo
      500: '#6366f1',  // Secondary brand color
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Success state
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Warning state
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Error state
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};
