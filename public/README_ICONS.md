# PWA Icons

This directory should contain the following icon files for the PWA:

- `icon-192.png` - 192x192 pixels (required)
- `icon-512.png` - 512x512 pixels (required)

## How to Create Icons

1. Create a square image (at least 512x512 pixels)
2. Use your app logo or a simple design
3. Export as PNG with transparent background (optional)
4. Resize to both 192x192 and 512x512
5. Place both files in the `/public` directory

## Online Tools

- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Quick Command (using ImageMagick)

```bash
# If you have a source image (logo.png)
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

## Icon Guidelines

- Use simple, recognizable designs
- Ensure icons are clear at small sizes
- Use high contrast colors
- Follow platform guidelines (iOS, Android)
