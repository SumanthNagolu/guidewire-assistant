# Productivity Capture Agent

Lightweight screenshot capture agent for InTime productivity tracking system.

## Features

✅ **Minimal footprint** - ~200 lines of code  
✅ **Simple capture** - Screenshots every 30 seconds  
✅ **Idle detection** - MD5 hash comparison  
✅ **Auto-upload** - Sends to Next.js API  
✅ **Error handling** - Retries and graceful failures  

## Quick Start

```bash
# Install dependencies
npm install

# Copy config
cp config.example .env

# Run in development
npm run dev

# Build and run
npm run build
npm start
```

## Configuration

Edit `.env` file:

```env
API_URL=http://localhost:3000    # Your Next.js app URL
USER_ID=admin@intimesolutions.com # Your email or user ID
CAPTURE_INTERVAL=30              # Seconds between captures
SCREENSHOT_QUALITY=60            # JPEG quality (1-100)
```

## How It Works

1. **Capture** - Takes screenshot every 30 seconds
2. **Hash** - Calculates MD5 hash for idle detection
3. **Compare** - Checks if screen changed
4. **Upload** - Sends to `/api/productivity/capture`
5. **Repeat** - Continues until stopped

## API Integration

The agent sends POST requests to:
```
POST /api/productivity/capture
{
  "image": "base64_encoded_jpeg",
  "userId": "user@email.com",
  "timestamp": "2024-01-01T12:00:00Z",
  "screenHash": "md5_hash",
  "idleDetected": false,
  "metadata": {
    "systemTime": "2024-01-01T12:00:00Z",
    "application": "Application",
    "windowTitle": "Window Title"
  }
}
```

## Resource Usage

- **CPU**: ~1-2% average
- **Memory**: ~50-80 MB
- **Network**: ~200 KB per screenshot
- **Disk**: None (no local storage)

## Platform Support

- ✅ macOS
- ✅ Windows  
- ✅ Linux (X11)

## Troubleshooting

### Cannot capture screenshots
- **macOS**: Grant screen recording permission in System Preferences
- **Windows**: Run as administrator if needed
- **Linux**: Ensure X11 access permissions

### Connection errors
- Check API_URL is correct
- Verify Next.js app is running
- Check network connectivity

### High CPU usage
- Increase CAPTURE_INTERVAL
- Lower SCREENSHOT_QUALITY

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name productivity-capture
pm2 save
pm2 startup
```

### Using systemd
Create `/etc/systemd/system/productivity-capture.service`:
```ini
[Unit]
Description=Productivity Capture Agent
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/productivity-capture
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable productivity-capture
sudo systemctl start productivity-capture
```

## Security Notes

- Runs with user privileges only
- No data stored locally
- All communication over HTTP/HTTPS
- Credentials in environment variables

## License

MIT - InTime eSolutions
