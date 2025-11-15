# InTime Productivity Agent

Desktop monitoring agent for IntimeESolutions productivity tracking platform.

## Features

- **Activity Tracking**: Monitor keyboard and mouse activity
- **Application Monitoring**: Track which applications are being used
- **Screenshot Capture**: Periodic screenshots (configurable interval)
- **Automatic Sync**: Data automatically syncs to the cloud dashboard
- **System Tray**: Runs quietly in the background
- **Privacy Controls**: Pause/resume tracking, configure screenshot intervals

## Installation

### For End Users

1. Download the installer for your platform:
   - Windows: `IntimeESolutions-Agent-Setup.exe`
   - macOS: `IntimeESolutions-Agent.dmg`
   - Linux: `IntimeESolutions-Agent.AppImage`

2. Run the installer and follow the prompts

3. The agent will start automatically on system boot

4. Configure your API key in Settings (right-click system tray icon)

### For Developers

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Run in development mode:
```bash
npm run dev
# In another terminal:
npm start
```

4. Package for distribution:
```bash
npm run package
```

## Configuration

Create a `.env` file in the project root:

```env
API_URL=https://intimesolutions.com
API_KEY=your_api_key_here
DASHBOARD_URL=https://intimesolutions.com/productivity
```

Or configure through the Settings window (accessible from system tray).

## Architecture

```
desktop-agent/
├── src/
│   ├── main.ts              # Electron main process
│   ├── tracker/
│   │   ├── activity.ts      # Activity monitoring
│   │   ├── screenshots.ts   # Screenshot capture
│   │   └── applications.ts  # Application tracking
│   ├── sync/
│   │   └── uploader.ts      # Data sync to server
│   └── config/
│       └── manager.ts       # Configuration management
├── assets/
│   ├── settings.html        # Settings UI
│   └── icon.png            # Application icon
└── package.json
```

## Privacy & Security

- All data is encrypted in transit (HTTPS)
- Screenshots are compressed and stored temporarily
- No personal data is collected beyond work activity
- Users can pause tracking at any time
- Compliant with employee monitoring regulations

## API Endpoints

The agent communicates with these endpoints:

- `POST /api/productivity/sync` - Sync activity data
- `POST /api/productivity/screenshots` - Upload screenshots
- `GET /api/productivity/status` - Health check

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run the agent
npm start
```

### Creating Installers

```bash
# Build for all platforms
npm run package

# Platform-specific builds
npm run package:win
npm run package:mac
npm run package:linux
```

## Troubleshooting

### Agent won't start

- Check that Node.js is installed (v18 or higher)
- Verify API credentials in settings
- Check system tray for the agent icon

### Data not syncing

- Verify internet connection
- Check API URL and key in settings
- View logs in `~/.intime-agent/logs/`

### Screenshots not working

- Ensure screenshot permissions are granted (macOS/Linux)
- Check available disk space
- Verify screenshot interval is set correctly

## Support

For issues or questions:
- Email: support@intimesolutions.com
- Dashboard: https://intimesolutions.com/productivity
- Documentation: https://docs.intimesolutions.com

## License

Proprietary - IntimeESolutions




