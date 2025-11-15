# Packaging the InTime Productivity Agent

These steps use [electron-builder](https://www.electron.build/) to generate installers for each platform. Run them from the `desktop-agent/` directory.

## Prerequisites

- Node.js 18+
- npm packages installed (`npm install`)
- Supabase environment variables configured in `.env`
- macOS for DMG builds, Windows for MSI/EXE builds (or use CI)

## Commands

```bash
# macOS DMG
e npm run package:mac

# Windows NSIS installer
e npm run package:win

# Linux AppImage
e npm run package:linux
```

Generated artifacts are written to `desktop-agent/release/`.

## Notes

- Icons currently use the default Electron assets. Replace them by adding `assets/icon.icns` / `icon.ico` and updating `package.json`.
- Code signing is not configured. Add `CSC_IDENTITY_AUTO_DISCOVERY=false` in CI or provide certificates as needed.
- To include additional files, edit the `build.files` array in `package.json`.


