# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page QR code generator web application built with vanilla HTML/CSS/JavaScript and Tailwind CSS. Generates QR codes for multiple content types with customizable frames and theming.

## Development

No build process required. Open `index.html` directly in a browser to run.

## Architecture

**index.html** - Main entry point containing:
- All HTML structure and forms for each content type
- Tailwind CSS configuration with custom brand colors (green theme)
- CSS for frame styles (decorative and themed) and dark mode
- CDN imports: Tailwind, QRCode.js, html2canvas, DM Sans font

**js/app.js** - Core application logic:
- `App` object handles initialization, type switching, QR generation, and exports
- Uses `QRTypes` encoders to get formatted content string
- Uses `new QRCode(element, options)` API from qrcodejs library
- Manages dark/light theme toggle with localStorage persistence
- Export methods: PNG (via html2canvas for frames), SVG, clipboard

**js/qr-types.js** - Content type encoders:
- Each type has `encode()` returning formatted string and `validate()` method
- Formats: URL, vCard (BEGIN:VCARD format), mailto:, sms:, WIFI: protocol
- Social types build profile/share URLs for Twitter/Facebook

**js/frames.js** - Frame management:
- `FrameManager` wraps QR code element in decorative frame divs
- `rebuildFrame()` moves qrCode element into frame wrapper structure
- Frame HTML uses `.qr-inner` container for positioning

## Key Implementation Details

- QR generation is debounced (250ms) on input changes
- Frames are CSS-based (not images) using pseudo-elements and gradients
- Dark mode applies `.dark` class to `<html>` element
- Frame buttons exist in two groups: basic (#frameSelector) and themed (#frameSelector2)
