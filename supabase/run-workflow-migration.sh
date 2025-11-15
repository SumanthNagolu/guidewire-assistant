#!/bin/bash

# Run Trikala Workflow Platform Migration Script

echo "🚀 Starting Trikala Workflow Platform Migration..."

# Check if .env or .env.local exists
if [ -f .env ]; then
    source .env
elif [ -f .env.local ]; then
    source .env.local
else
    echo "❌ No .env or .env.local file found. Please create one with your Supabase credentials."
    exit 1
fi

# Run the migration
echo "📊 Creating workflow platform tables..."
# Using environment variables for PostgreSQL connection
export PGPASSWORD='Sumanthlucky$24'
psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.jbusreaeuxzpjszuhvre -d postgres -f ./supabase/migrations/20250113_trikala_workflow_schema.sql

echo "✅ Migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. The pod management system is ready at /platform/pods"
echo "2. Create your first pod and assign team members"
echo "3. Start creating workflows for your operations"
echo ""
echo "🎯 Access the platform at: http://localhost:3000/platform"
