# Productivity Dashboard Setup & Testing Guide

## ✅ Current Status

Both the **Next.js server** and **Desktop Agent** are running and configured correctly:

- **Next.js Server**: Running on http://localhost:3000
- **Desktop Agent**: Capturing activity every minute, screenshots every 30 seconds
- **API Authentication**: Using `test-key` for local testing

## 🚀 Quick Start

### 1. Create Test User in Supabase

Run this SQL in your Supabase SQL Editor to create a test user:

```sql
-- Create test user profile (simplified version)
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'test@intimesolutions.com',
  'Test',
  'User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
```

### 2. Create Storage Bucket for Screenshots

Run this SQL to create the storage bucket:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productivity-screenshots',
  'productivity-screenshots',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Verify Desktop Agent is Syncing

Check the terminal where the desktop agent is running. You should see:

```
📊 SYNCING DATA: { mouseMovements: 45, keystrokes: 28, activeTime: 60 seconds }
✅ Data synced successfully to database!
📸 Screenshot captured: /path/to/screenshot.png
✅ Screenshot uploaded successfully
```

### 4. View the Dashboard

Open: http://localhost:3000/productivity/insights

You should see:
- **Activity Metrics**: Keystrokes, mouse movements, active time
- **Application Usage**: Top applications used today
- **Screenshots**: Visual timeline of your work
- **Productivity Score**: Overall productivity rating

## 🔧 Troubleshooting

### If Dashboard Shows "No user profiles found"

1. Run the SQL script above to create a test user
2. Refresh the dashboard

### If No Data Appears

1. Check the desktop agent terminal for sync messages
2. Wait 1-2 minutes for data to accumulate
3. Refresh the dashboard

### If Screenshots Don't Appear

1. Ensure the storage bucket exists in Supabase
2. Check the agent terminal for screenshot upload messages
3. Screenshots are captured every 30 seconds

## 📊 What's Being Tracked

The desktop agent tracks:
- **Mouse Movements**: Total distance moved
- **Keystrokes**: Total keys pressed
- **Active Time**: Time spent actively working
- **Idle Time**: Time spent idle
- **Applications**: Which apps you're using and for how long
- **Screenshots**: Visual record of your work (every 30 seconds for testing)

## 🛠 Configuration Files

### Desktop Agent Config
Location: `~/.intime-agent/config.json`

```json
{
  "apiUrl": "http://localhost:3000",
  "apiKey": "test-key",
  "dashboardUrl": "http://localhost:3000/productivity",
  "screenshotsEnabled": true,
  "screenshotInterval": 600000,
  "screenshotQuality": 50,
  "syncInterval": 300000
}
```

### Environment Variables
The system uses `test-key` authentication for local testing, no additional setup needed.

## 📝 Next Steps

1. **Create Test User**: Run the SQL script in Supabase
2. **Wait for Data**: Let the agent run for 2-3 minutes
3. **View Dashboard**: Open http://localhost:3000/productivity/insights
4. **See Screenshots**: They'll appear after 30-60 seconds

## 🎯 Testing Checklist

- [ ] Test user created in Supabase
- [ ] Storage bucket created for screenshots
- [ ] Desktop agent showing sync success messages
- [ ] Dashboard displays activity metrics
- [ ] Screenshots appear in the timeline
- [ ] Application usage is tracked

## 💡 Tips

- The agent simulates activity for testing (random keystrokes/mouse movements)
- Screenshots are taken every 30 seconds (normally 10 minutes)
- Data syncs immediately on activity detection
- Dashboard auto-refreshes are not implemented yet - manual refresh needed

## 🐛 Known Issues

1. **Dashboard requires manual refresh** - Auto-refresh coming soon
2. **Test mode only** - Production authentication coming soon
3. **Screenshots may fail on some systems** - Fallback to activity-only tracking

## 📞 Support

If you encounter issues:
1. Check both terminal windows for error messages
2. Verify Supabase tables exist (productivity_sessions, productivity_applications, productivity_screenshots)
3. Ensure storage bucket is created and public


