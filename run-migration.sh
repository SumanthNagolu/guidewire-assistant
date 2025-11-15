#!/bin/bash

# Quick migration script for unified productivity system
echo "🚀 Running Unified Productivity System Migration..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

# Extract Supabase URL and key from .env.local
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2)
SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Missing Supabase credentials in .env.local"
    exit 1
fi

# Extract host from URL
SUPABASE_HOST=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co.*||').supabase.co

echo "📊 Connecting to: $SUPABASE_HOST"
echo ""
echo "Please run this SQL in your Supabase SQL Editor:"
echo "----------------------------------------"
cat database/unified-productivity-schema.sql
echo "----------------------------------------"
echo ""
echo "OR use psql:"
echo "psql -h db.$SUPABASE_HOST -U postgres -d postgres < database/unified-productivity-schema.sql"
echo ""
echo "After running the migration, test with:"
echo "node test-productivity-flow.js"
