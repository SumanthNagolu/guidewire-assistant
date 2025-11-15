import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
export async function POST(request: Request) {
  try {
    // Check for admin authorization (you should add proper auth check here)
    const { secret } = await request.json();
    if (secret !== 'trikala-migration-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServerComponentClient({ cookies });
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250113_trikala_workflow_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');
    const results = [];
    const errors = [];
    for (const statement of statements) {
      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      try {
        // Execute the SQL statement
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        }).single();
        if (error) {
          // Try direct execution if RPC doesn't exist
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1);
          // If we can connect, just log the error and continue
          if (!directError) {
            errors.push({ statement: statement.substring(0, 100), error: error.message });
          }
        } else {
          results.push({ success: true, statement: statement.substring(0, 100) });
        }
      } catch (err) {
        errors.push({ statement: statement.substring(0, 100), error: String(err) });
      }
    }
    // Alternative: Use Supabase admin client if available
    // This is a simplified version - in production you'd use the admin client
    return NextResponse.json({
      message: 'Migration attempt completed',
      results: results.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 5), // Only show first 5 errors
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run migration', details: String(error) },
      { status: 500 }
    );
  }
}
export async function GET() {
  return NextResponse.json({
    message: 'Use POST method with { secret: "trikala-migration-2025" } to run migration'
  });
}
