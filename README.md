# TogglXUrenregistratie

TogglXUrenregistratie is a chrome plugin designed to copy time entries from [TogglTrack](https://toggl.com/) into Covadis' [Urenregistratie](https://covadis-urenregistratie.azurewebsites.net/). The plugin will automatically pull and display all registered time entries from TogglTrack for the current selected date in Urenregistratie. To save a time entry group to Urenregistratie, simply press the save button and TogglXUrenregistratie will do the rest.

## Installation

Installation guide will be added in the future.

## Developing

- Install all npm dependencies:

```bash
npm install
```

- Start build watch

```bash
npm run watch
```

- Once the watch script is running, open chrome and navigate to extension settings, usually [chrome://extensions/](chrome://extensions/). Enable developer mode and click the `Load unpacked` button. Select the `dist/extension/browser` folder. The extension is now loaded into the browser. Any changes will automatically be compiled into the `dist/` folder aswell.
  - When making changes in the popup (angular) code, simply re-opening the popup will load the latest changes.
  - When making changes in the content script code, a total reload of the extension is required. This can be done in extension settings. Click the reload button on the extension, after the extension is reloaded, refresh any open webpages to load latest the changes.

## Building

To build the project for production run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. The production build optimizes the plugin for performance and speed and size.
