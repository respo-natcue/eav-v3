# Andrej Karpathy Updates Chrome Extension

A sleek, beautiful Chrome Extension built to track the latest blog posts and X (Twitter) posts of Andrej Karpathy natively inside your browser. No API keys required.

## Features

* **Latest Blogs**: Fetches directly from `karpathy.github.io/feed.xml` and parses them into a beautiful timeline.
* **Latest X (Twitter) Posts**: Uses the hidden syndication API to securely fetch his most recent tweets without requiring the user to set up complex Twitter Developer API keys.
* **Modern Design**: Hand-crafted UI featuring dark mode, glassmorphism, smooth animations, and clean typography matching modern UI paradigms.
* **Manifest V3**: Fully optimized and secure following the latest Chrome Web Store standards.

## Project Initial Setup

No complex build step is needed. This extension is built using vanilla HTML, CSS, and JS to keep it lightweight, fast, and easily understandable.

To test or install this extension locally:

1. Open a new tab in Google Chrome and navigate to `chrome://extensions/`.
2. Ensure the **"Developer mode"** toggle in the top-right corner is turned **ON**.
3. Click the **"Load unpacked"** button in the top-left menu.
4. Browse your file system and select the `karpathy-tracker-ext` folder (the one containing `manifest.json`).
5. The extension is now installed! You will see the glowing neon "K" icon in your extensions tray. Click it to view the updates.

## Architecture

* `manifest.json`: Configuration for MV3, allowing fetch requests to his blog and twitter syndication.
* `popup.html/.css/.js`: The frontend interface that renders the tabs and fetches the parsed data dynamically.
* `background.js`: A service worker ready for future enhancements (e.g. background polling and badge notifications).
* `assets/`: Contains the extension icons.
