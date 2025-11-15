import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/cron/calculate-scores - Calculate daily productivity scores (runs at 11 PM daily)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    // Get all active employees
    const { data: employees } = await supabase
      .from('user_profiles')
      .select('id')
      .in('role', ['employee', 'recruiter', 'sales', 'operations', 'admin']);
    if (!employees) {
      return NextResponse.json({ message: 'No employees found' });
    }
    // Call the calculate stats API for each user
    const results = [];
    for (const employee of employees) {
      try {
        // Note: This would normally use internal function call
        // For now, we'll just trigger the existing API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/productivity/stats/calculate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({ date: today, user_id: employee.id }),
          }
        );
        const data = await response.json();
        results.push({ user_id: employee.id, success: data.success });
      } catch (error) {
        results.push({ user_id: employee.id, success: false, error: String(error) });
      }
    }
    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      date: today,
      total_employees: employees.length,
      scores_calculated: successCount,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to calculate scores', details: error.message },
      { status: 500 }
    );
  }
}
