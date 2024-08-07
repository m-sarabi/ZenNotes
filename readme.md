# ZenNotes Extension

ZenNotes is a Chromium/firefox extension that allows you to quickly take notes directly from your browser. You can save selected text from any webpage as a note, and manage your notes through a simple interface.

## Features

- Save selected text as notes via the context menu.
- View and manage your notes in a popup interface.
- Notes are stored using IndexedDB for persistent storage.
- Edit notes, add titles, change the color, or delete them.
- Assign priorities and categories to your notes.
- Dark/Light mode support.
- Search functionality:
  - Very fast.
  - Case-insensitive.
  - Filter by category, priority, or time.
- Smooth note preview animations.

## Screenshots

| ![2024-08-05_14-23](https://github.com/user-attachments/assets/2be7724b-58fb-4bca-86a9-4a828841b46e) | ![2024-08-05_14-30](https://github.com/user-attachments/assets/62e3ceb3-8578-4648-adda-dc00e84ad86b) | ![2024-08-05_14-31](https://github.com/user-attachments/assets/5dccf63b-fa0c-4a92-afa6-80a5c163433b) |
| ---- | ---- | ---- |
| ![2024-08-05_14-38](https://github.com/user-attachments/assets/e831f606-c5f5-4245-a637-2f3cc82fbeff) | ![2024-08-05_14-36_1](https://github.com/user-attachments/assets/199a28b7-5021-464e-ad1e-5b2a7f791365) | ![side](https://github.com/user-attachments/assets/8995d72c-a6bf-48e6-a973-f540c2e1a4d1) |

## Installation

### Chrome/Edge

1. Clone the repository or download the ZIP file and extract it.
2. Open Chrome/Edge and navigate to `chrome://extensions/`/`edge://extensions/`.
3. Enable "Developer mode".
4. Click on "Load unpacked" and select the directory containing the extension files.

### Firefox
Go to [ZenNotes on Firefox Add-ons!](https://addons.mozilla.org/en-GB/firefox/addon/zennotes/) and download it there.

In case you want to install it manually:
1. Clone the repository or download the ZIP file and extract it.
2. Replace `manifest.json` with `manifest_firefox.json`.
3. Go to `about:debugging#/runtime/this-firefox`
4. Select `Load Temporary Add-on…`
5. Select any file in the main folder (like manifest.json)

## Usage

1. Select text on any webpage.
2. Right-click and choose "Save as Note" from the context menu.
3. Click on the extension icon to view and manage your notes.
4. Alternatively, you can use the popup interface to create, edit, and delete notes.

## Planned Features

- Reorder categories.

## License

This project is licensed under the MIT License.
