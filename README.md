# TogglXUrenregistratie

TogglXUrenregistratie is a chrome extension designed to copy time entries from [TogglTrack](https://toggl.com/) into Covadis' [Urenregistratie](https://covadis-urenregistratie.azurewebsites.net/). When logged in with toggl, all time entries for the selected date will be fetched. Time entries can be saved by simply clicking the save button. The extension works by using the TogglTrack API to fetch all time entries based on the selected day in Urenregistratie. Saving entries works by manipulating the page DOM to fill all required form fiels and submitting the form. This implementation results in needing to do very litle reverse-engineering to do simple time registration.

## Features

- List all TogglTrack time entries for the current selected day in Urenregistratie
- Save a group of time entries (based on description) to Urenregistratie
- Some configuration
- Auth to toggl using either email+password or api key

## Configuration

The extension can be configured through the settings menu (accessible via the menu button in the extension popup):

### General Settings

- **Description Selector**: Template for parsing PBI and description from Toggl entries _(not tested very well so use with care)_
  - Must contain both `{pbi}` and `{description}` tokens
  - Example: `{pbi} - {description}` or `{description} {pbi}`
  - Supports regex patterns

### Rounding Settings

- **Rounding Time**: Choose how time entries are rounded (1m, 5m, or 10m)
- **Rounding Direction**: Choose rounding direction (nearest, always up, or always down)

### Backup & Restore

- **Export Settings**: Download your settings as a JSON file
- **Import Settings**: Restore settings from a previously exported JSON file

## Installation

Currently the only way of installing the extension is using the unpacked version. Download your preferred version from the releases tab and unpack it. To install the unpacked extension, open chrome and navigate to extension settings, usually [chrome://extensions/](chrome://extensions/). Enable developer mode and click the `Load unpacked` button. Select the `/browser` directory. The extension is now loaded into the browser. You might need to refresh any open webpages for the extension to work correctly.

## Roadmap

### 0.2.0

- Handle multiple returned pbi's (Instead of just grabbing the first)
- Better handle low toggl rate limits (For example caching)

### 1.0.0

TODO: T.B.D

## Developing

- Install all npm dependencies:

```bash
npm install
```

- Start build watch

```bash
npm run watch
```

- Once the watch script is running, open chrome and navigate to extension settings, usually [chrome://extensions/](chrome://extensions/). Enable developer mode and click the `Load unpacked` button. Select the `dist/extension/browser` directory. The extension is now loaded into the browser. Any changes will automatically be compiled into the `dist/` directory aswell.
  - When making changes in the popup (angular) code, simply re-opening the popup will load the latest changes.
  - When making changes in the content script code, a total reload of the extension is required. This can be done in extension settings. Click the reload button on the extension, after the extension is reloaded, refresh any open webpages to load latest the changes.

### Project structure

- `src/popup`: All popup/ui related code. Toggl time entries are also fetched here.
- `src/content`: Code injected into webpages. Only used for reading/writing to the page DOM.
- `src/core`: Any shared code/models used in both the popup and content script.
  - This folder has a `ExtensionMessenger` class which acts as an abstraction over the communication between the popup and content script. Try to use this at all times when communication is needed.

## Tech Stack

- Angular 20
  - RxJS for reactive programming
- PrimeNG UI components and icons
- TypeScript
  - Angular supports typescript out of the box when using `ng build`. Esbuild is used for building the content script.
- Chrome Extension Manifest V3

## Building

To build the project for production run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. The production build optimizes the extension for performance, speed and size.
