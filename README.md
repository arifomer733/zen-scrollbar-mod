# Zen Scrollbar Mod

A lightweight browser extension for Zen Browser (Firefox-based) that replaces standard browser scrollbars with custom overlay scrollbars. It consumes zero layout space, auto-hides when idle, and expands on hover for easy interaction.

## Features

- **Zero Layout Shift**: The scrollbars float on top of the web content (overlay layout) without pushing page elements.
- **Auto-Hide**: Fades out automatically after 1.2 seconds of scroll inactivity.
- **Responsive Styling**: Starts as a subtle 2px hairline and expands to a comfortable 10px grab width on hover.
- **Global Toggle**: Turn it ON or OFF with a single click from the browser toolbar button.
- **State Persistence**: Remembers your preference (ON/OFF) across page reloads and new tab navigation.

## Installation

### For Developers / Temporary Installation
1. Download or clone this repository.
2. Open Zen Browser / Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` from the root of this folder.

### For Users / Permanent Installation
Once the extension is signed and published, you can install the `.xpi` file directly by dragging and dropping it into your browser.

## File Structure

- `manifest.json`: WebExtension Manifest V2 configuration (required for Zen Browser/Firefox compatibility).
- `background.js`: Manages the global toggle state and updates the extension toolbar badge.
- `content.js`: Handles DOM style injection, event listeners for scrolling/resizing, and custom overlay scrollbar components.
- `styles.css`: CSS Reference styles.

## License

This project is licensed under the MIT License.

