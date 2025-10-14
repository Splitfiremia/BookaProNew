# Font Information

This directory contains the Lufea font family used in the app.

Font files:
- Lufea-Regular.ttf - Regular weight
- Lufea-Bold.ttf - Bold weight

The app has been configured to use these custom fonts throughout the UI.

## Font Usage

The fonts are loaded in app/_layout.tsx using expo-font and are referenced in:

1. constants/theme.ts - For global font definitions
2. tailwind.config.js - For Tailwind CSS classes
3. Component-specific styles

If you need to update the fonts, replace the font files in this directory and ensure they maintain the same filenames.