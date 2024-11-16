import { DarkTheme as DefaultDarkTheme, DefaultTheme } from "@react-navigation/native";

export const TINT_COLOR = '#6E4E2E';

export const DarkTheme = {
  dark: true,
  colors: {
    primary: '#D4A373', // Accent color
    background: '#4B2E17', // Rich Leather Brown
    card: '#3B2313', // Slightly darker background for cards
    text: '#F5F5DC', // Beige/Off-White
    border: '#6E4E2E', // Medium Brown
    notification: '#F0E68C', // Highlight/Notification color
  },
  fonts: DefaultDarkTheme.fonts
};

export const LightTheme = {
  dark: false,
  colors: {
    primary: '#8B4513', // Saddle Brown
    background: '#F5F0EB', // Soft Parchment
    card: '#EDE6DF', // Lighter parchment for cards
    text: '#4B2E17', // Rich Leather Brown
    border: '#C9B89E', // Light Tan
    notification: '#D2B48C', // Highlight/Notification color
  },
  fonts: DefaultTheme.fonts
};
