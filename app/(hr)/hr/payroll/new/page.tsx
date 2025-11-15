'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewPayrollCyclePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  // Auto-suggest next month cycle
  useEffect(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const startDate = nextMonth.toISOString().split('T')[0];
    const endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setFormData({
      name: nextMonthName,
      start_date: startDate,
      end_date: endDate,
      notes: '',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TC-PAY-006: Validation
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      // Generate cycle code from dates
      const startDate = new Date(formData.start_date);
      const cycleCode = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

      // Check for overlapping cycles
      const { data: existing } = await supabase
        .from('payroll_cycles')
        .select('id')
        .eq('cycle_code', cycleCode)
        .single();

      if (existing) {
        toast.error('A payroll cycle already exists for this period');
        setLoading(false);
        return;
      }

      // Count active employees
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('employment_status', 'Active');

      // Create cycle
      const cycleData = {
        name: formData.name,
        cycle_code: cycleCode,
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || null,
        status: 'Draft',
        total_employees: employeeCount || 0,
        total_gross: 0,
        total_deductions: 0,
        total_net: 0,
      };

      const { data: newCycle, error } = await supabase
        .from('payroll_cycles')
        .insert(cycleData)
        .select()
        .single();

      if (error) throw error;

      // Log action
      await supabase.from('payroll_processing_logs').insert({
        payroll_cycle_id: newCycle.id,
        action: 'created',
        status: 'success',
        message: `Payroll cycle ${formData.name} created`,
      });

      toast.success(`Payroll cycle created successfully!`);
      router.push(`/hr/payroll/${newCycle.id}`);
    } catch (error) {
      toast.error('Failed to create payroll cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/hr/payroll">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Payroll Cycle</h1>
          <p className="text-gray-600 mt-1">Set up a new monthly payroll cycle</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Cycle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TC-PAY-005, TC-PAY-007 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Cycle Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., March 2025, Q1 2025"
                required
              />
              <p className="text-xs text-gray-500">
                Descriptive name for this payroll cycle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  min={formData.start_date}
                />
              </div>
            </div>

            {/* TC-PAY-006: Validation feedback */}
            {formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date) && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                ⚠️ End date must be after start date
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes or instructions for this cycle"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/hr/payroll">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.start_date || !formData.end_date}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Cycle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 Tips for Creating Payroll Cycles</h3>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Create cycles at least 1 week before month-end for processing time</li>
            <li>Ensure all timesheets are approved before processing</li>
            <li>Verify employee bank details are up-to-date</li>
            <li>You can review and modify cycle details before final processing</li>
            <li>Once processed, cycles cannot be edited (view-only)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

