#!/bin/bash

echo "🚀 Running Unified Productivity System Migration..."
echo "================================================"
echo ""
echo "IMPORTANT: Please run this SQL in your Supabase Dashboard:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in sidebar"
echo "4. Copy the SQL below and paste it:"
echo "5. Click 'Run' button"
echo ""
echo "========== COPY SQL BELOW =========="
cat database/unified-productivity-schema.sql
echo "========== END OF SQL =========="
echo ""
echo "After running the SQL, press Enter to continue..."
read
echo "✅ Migration assumed complete. Starting services..."


