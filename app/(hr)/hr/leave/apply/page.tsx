'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, CheckCircle, Upload, Save, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LeaveBalanceCard from '@/components/hr/leave/LeaveBalanceCard';

export default function ApplyLeavePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    first_day_half: false,
    first_day_half_type: 'Morning',
    last_day_half: false,
    last_day_half_type: 'Morning',
  });
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      calculateDays();
    }
  }, [formData.from_date, formData.to_date, formData.first_day_half, formData.last_day_half]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: emp } = await supabase
      .from('employees')
      .select('*, departments(id, name)')
      .eq('user_id', user.id)
      .single();
    setEmployee(emp);

    // Fetch team leaves for calendar display
    if (emp?.departments?.id) {
      const { data: teamMembers } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('department_id', emp.departments.id)
        .neq('id', emp.id)
        .eq('employment_status', 'Active');

      if (teamMembers && teamMembers.length > 0) {
        const teamIds = teamMembers.map((tm) => tm.id);
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('from_date, to_date, employee_id, employees(first_name, last_name)')
          .in('employee_id', teamIds)
          .in('status', ['Pending', 'Approved'])
          .gte('to_date', new Date().toISOString().split('T')[0]);

        setTeamLeaves(leaves || []);
      }
    }

    const { data: types } = await supabase
      .from('leave_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setLeaveTypes(types || []);

    const currentYear = new Date().getFullYear();
    const { data: balances } = await supabase
      .from('leave_balances')
      .select(`
        *,
        leave_types(name, code, days_per_year)
      `)
      .eq('employee_id', emp?.id || '')
      .eq('year', currentYear);
    setLeaveBalances(balances || []);
  };

  const calculateDays = () => {
    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    
    if (to < from) {
      setError('End date must be after start date');
      setTotalDays(0);
      return;
    }

    let diffTime = Math.abs(to.getTime() - from.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Subtract half-day adjustments
    let adjustment = 0;
    if (formData.first_day_half) adjustment += 0.5;
    if (formData.last_day_half) adjustment += 0.5;

    diffDays = Math.max(0, diffDays - adjustment);
    setTotalDays(diffDays);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate balance
      const selectedLeaveType = leaveTypes.find((lt) => lt.id === formData.leave_type_id);
      const balance = leaveBalances.find((lb) => lb.leave_type_id === formData.leave_type_id);

      if (!isDraft && balance && totalDays > balance.balance_days) {
        setError(
          `Insufficient leave balance. You have ${balance.balance_days} days available, requesting ${totalDays} days.`
        );
        setLoading(false);
        return;
      }

      // Check minimum notice period
      if (!isDraft && selectedLeaveType?.min_notice_days) {
        const fromDate = new Date(formData.from_date);
        const today = new Date();
        const daysDiff = Math.ceil((fromDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff < selectedLeaveType.min_notice_days) {
          setError(
            `This leave type requires at least ${selectedLeaveType.min_notice_days} days advance notice. You're requesting with ${daysDiff} days notice.`
          );
          setLoading(false);
          return;
        }
      }

      const { error: insertError } = await supabase.from('leave_requests').insert({
        employee_id: employee.id,
        leave_type_id: formData.leave_type_id,
        from_date: formData.from_date,
        to_date: formData.to_date,
        total_days: totalDays,
        reason: formData.reason,
        status: isDraft ? 'Draft' : 'Pending',
        metadata: {
          first_day_half: formData.first_day_half,
          first_day_half_type: formData.first_day_half_type,
          last_day_half: formData.last_day_half,
          last_day_half_type: formData.last_day_half_type,
        },
      });

      if (insertError) throw insertError;

      // Update pending days in balance (if not draft)
      if (!isDraft && balance) {
        await supabase
          .from('leave_balances')
          .update({
            pending_days: balance.pending_days + totalDays,
          })
          .eq('id', balance.id);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/hr/self-service');
      }, 2000);
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isDateConflict = (date: string) => {
    return teamLeaves.some((leave) => {
      const leaveFrom = new Date(leave.from_date);
      const leaveTo = new Date(leave.to_date);
      const checkDate = new Date(date);
      return checkDate >= leaveFrom && checkDate <= leaveTo;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-600 mt-1">Submit a new leave request</p>
      </div>

      {/* Leave Balances - Matching documentation */}
      {leaveBalances.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Leave Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaveBalances.map((balance) => (
              <LeaveBalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Application Form</CardTitle>
              <CardDescription>Fill in the details for your leave request</CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Leave request submitted successfully! Redirecting to your dashboard...
                  </AlertDescription>
                </Alert>
              ) : (
                <form className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Step 2: Select Leave Type - From documentation */}
                  <div className="space-y-2">
                    <Label htmlFor="leave_type">
                      Leave Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.leave_type_id}
                      onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => {
                          const balance = leaveBalances.find((lb) => lb.leave_type_id === type.id);
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                              {balance && ` (Balance: ${balance.balance_days} days)`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 2: Choose Dates - From documentation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from_date">
                        From Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="from_date"
                        type="date"
                        min={getMinDate()}
                        value={formData.from_date}
                        onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to_date">
                        To Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="to_date"
                        type="date"
                        min={formData.from_date || getMinDate()}
                        value={formData.to_date}
                        onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Step 3: Half-Day Options - FROM DOCUMENTATION */}
                  <div className="space-y-3 border-t pt-4">
                    <Label className="text-sm font-semibold">Half-Day Options (Optional)</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="first_day_half"
                          checked={formData.first_day_half}
                          onChange={(e) => setFormData({ ...formData, first_day_half: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="first_day_half" className="font-normal cursor-pointer">
                          First Day Half-Day
                        </Label>
                      </div>
                      
                      {formData.first_day_half && (
                        <div className="ml-6 flex space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="first_day_type"
                              value="Morning"
                              checked={formData.first_day_half_type === 'Morning'}
                              onChange={(e) => setFormData({ ...formData, first_day_half_type: e.target.value })}
                            />
                            <span className="text-sm">Morning (9 AM - 1 PM)</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="first_day_type"
                              value="Afternoon"
                              checked={formData.first_day_half_type === 'Afternoon'}
                              onChange={(e) => setFormData({ ...formData, first_day_half_type: e.target.value })}
                            />
                            <span className="text-sm">Afternoon (1 PM - 5 PM)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="last_day_half"
                          checked={formData.last_day_half}
                          onChange={(e) => setFormData({ ...formData, last_day_half: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="last_day_half" className="font-normal cursor-pointer">
                          Last Day Half-Day
                        </Label>
                      </div>

                      {formData.last_day_half && (
                        <div className="ml-6 flex space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="last_day_type"
                              value="Morning"
                              checked={formData.last_day_half_type === 'Morning'}
                              onChange={(e) => setFormData({ ...formData, last_day_half_type: e.target.value })}
                            />
                            <span className="text-sm">Morning</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="last_day_type"
                              value="Afternoon"
                              checked={formData.last_day_half_type === 'Afternoon'}
                              onChange={(e) => setFormData({ ...formData, last_day_half_type: e.target.value })}
                            />
                            <span className="text-sm">Afternoon</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Coverage Check - FROM DOCUMENTATION */}
                  {formData.from_date && formData.to_date && teamLeaves.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">
                            Team Coverage Alert
                          </p>
                          <p className="text-xs text-yellow-800 mt-1">
                            {teamLeaves.filter((tl) => {
                              const from = new Date(formData.from_date);
                              const to = new Date(formData.to_date);
                              const tlFrom = new Date(tl.from_date);
                              const tlTo = new Date(tl.to_date);
                              return (from <= tlTo && to >= tlFrom);
                            }).length}{' '}
                            team member(s) have overlapping leave during your selected dates
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Reason - FROM DOCUMENTATION */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Reason for Leave <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for your leave request (max 500 characters)"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={4}
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {formData.reason.length}/500 characters
                    </p>
                  </div>

                  {/* Step 5: Documents - FROM DOCUMENTATION */}
                  <div className="space-y-2">
                    <Label htmlFor="documents">
                      Supporting Documents {formData.leave_type_id === 'leave-002' && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Drag files here or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                      <Input
                        id="documents"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                    </div>
                    {formData.leave_type_id === 'leave-002' && (
                      <p className="text-xs text-orange-600">
                        Medical certificate required for sick leave
                      </p>
                    )}
                  </div>

                  {/* Action Buttons - FROM DOCUMENTATION */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e: any) => handleSubmit(e, true)}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={(e: any) => handleSubmit(e, false)}
                      disabled={
                        loading ||
                        !formData.leave_type_id ||
                        !formData.from_date ||
                        !formData.to_date ||
                        !formData.reason ||
                        totalDays === 0
                      }
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Summary Panel - FROM DOCUMENTATION Step 6 */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.leave_type_id && (
                <div>
                  <p className="text-xs text-gray-500">Leave Type:</p>
                  <p className="font-semibold">
                    {leaveTypes.find((lt) => lt.id === formData.leave_type_id)?.name || 'Not selected'}
                  </p>
                </div>
              )}

              {formData.from_date && formData.to_date && (
                <div>
                  <p className="text-xs text-gray-500">Duration:</p>
                  <p className="font-semibold">
                    {new Date(formData.from_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(formData.to_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-indigo-600 mt-1">
                    {totalDays} day{totalDays !== 1 ? 's' : ''}
                    {formData.first_day_half && ' (1st day half)'}
                    {formData.last_day_half && ' (last day half)'}
                  </p>
                </div>
              )}

              {formData.leave_type_id && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">Current Balance:</p>
                    <p className="text-lg font-bold text-gray-900">
                      {leaveBalances.find((lb) => lb.leave_type_id === formData.leave_type_id)
                        ?.balance_days || 0}{' '}
                      days
                    </p>
                  </div>

                  {totalDays > 0 && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Pending:</p>
                        <p className="font-semibold text-orange-600">
                          {leaveBalances.find((lb) => lb.leave_type_id === formData.leave_type_id)
                            ?.pending_days || 0}{' '}
                          days
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-xs text-gray-500">Balance After Request:</p>
                        <p className="text-lg font-bold text-green-600">
                          {Math.max(
                            0,
                            (leaveBalances.find((lb) => lb.leave_type_id === formData.leave_type_id)
                              ?.balance_days || 0) - totalDays
                          )}{' '}
                          days
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">Status:</p>
                <p className="text-sm font-medium">Will be: ⏳ Pending Approval</p>
              </div>

              {employee?.reporting_manager && (
                <div>
                  <p className="text-xs text-gray-500">Approver:</p>
                  <p className="text-sm font-medium">
                    {employee.reporting_manager.first_name} {employee.reporting_manager.last_name} (Manager)
                    <br />
                    <span className="text-xs text-gray-500">→ HR Final Approval</span>
                  </p>
                </div>
              )}

              {/* Team Calendar Preview */}
              {teamLeaves.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Team Availability:</p>
                  <div className="space-y-1">
                    {teamLeaves.slice(0, 3).map((leave, idx) => (
                      <p key={idx} className="text-xs text-gray-600">
                        🔴 {leave.employees?.first_name} on leave{' '}
                        {new Date(leave.from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        -
                        {new Date(leave.to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    ))}
                    {teamLeaves.length > 3 && (
                      <p className="text-xs text-gray-500">+{teamLeaves.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
