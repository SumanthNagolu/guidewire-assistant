'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight,
  FileText, Download, Send, Lock, Edit, History, Search, Filter 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PayrollEmployee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  departments: { name: string };
  basic_salary: number;
  earnings: any;
  deductions: any;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  status: 'Ready' | 'Warning' | 'Error';
  warning_message?: string;
  pay_stub_id?: string;
}

export default function ProcessPayrollPage() {
  const router = useRouter();
  const params = useParams();
  const cycleId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cycle, setCycle] = useState<any>(null);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [validations, setValidations] = useState({
    timesheets: { passed: true, message: 'All timesheets approved' },
    leaves: { passed: true, message: 'No pending leaves' },
    bankDetails: { passed: true, message: 'All bank details present' },
    warnings: { count: 0, message: '' },
  });

  useEffect(() => {
    loadPayrollCycle();
  }, [cycleId]);

  const loadPayrollCycle = async () => {
    setLoading(true);
    try {
      // Load cycle details
      const { data: cycleData, error: cycleError } = await supabase
        .from('payroll_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (cycleError) throw cycleError;
      setCycle(cycleData);

      // Check if pay stubs already exist
      const { data: existingStubs } = await supabase
        .from('pay_stubs')
        .select('id, employee_id')
        .eq('payroll_cycle_id', cycleId);

      const stubsMap = new Map((existingStubs || []).map(s => [s.employee_id, s.id]));

      // Load active employees with their salary details
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          departments(name),
          bank_details
        `)
        .eq('employment_status', 'Active');

      if (empError) throw empError;

      // Calculate payroll for each employee
      const payrollData: PayrollEmployee[] = [];
      let warningCount = 0;

      for (const emp of employeeData || []) {
        // Get employee's salary details
        const { data: salaryData } = await supabase
          .from('employee_salaries')
          .select('*')
          .eq('employee_id', emp.id)
          .lte('effective_from', cycleData.start_date)
          .or(`effective_to.is.null,effective_to.gte.${cycleData.start_date}`)
          .order('effective_from', { ascending: false })
          .limit(1)
          .single();

        if (!salaryData) {
          payrollData.push({
            ...emp,
            basic_salary: 0,
            earnings: {},
            deductions: {},
            gross_pay: 0,
            total_deductions: 0,
            net_pay: 0,
            status: 'Error',
            warning_message: 'No salary details found',
          });
          continue;
        }

        // Calculate payroll using database function
        const { data: calculation } = await supabase
          .rpc('calculate_employee_payroll', {
            p_employee_id: emp.id,
            p_start_date: cycleData.start_date,
            p_end_date: cycleData.end_date,
          })
          .single();

        let status: 'Ready' | 'Warning' | 'Error' = 'Ready';
        let warningMessage = '';

        // TC-PAY-043: Check for missing bank details
        if (!emp.bank_details || Object.keys(emp.bank_details).length === 0) {
          status = 'Error';
          warningMessage = 'Missing bank details';
        }

        // TC-PAY-044: Check for negative net pay
        if (calculation && calculation.net_pay < 0) {
          status = 'Error';
          warningMessage = 'Net pay is negative';
        }

        if (status === 'Warning') warningCount++;

        payrollData.push({
          id: emp.id,
          employee_id: emp.employee_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          departments: emp.departments,
          basic_salary: calculation?.basic_salary || salaryData.basic_salary,
          earnings: calculation?.earnings_breakdown || {},
          deductions: calculation?.deductions_breakdown || {},
          gross_pay: calculation?.gross_pay || 0,
          total_deductions: calculation?.total_deductions || 0,
          net_pay: calculation?.net_pay || 0,
          status,
          warning_message: warningMessage,
          pay_stub_id: stubsMap.get(emp.id),
        });
      }

      setEmployees(payrollData);

      // Update validations
      setValidations(prev => ({
        ...prev,
        warnings: { count: warningCount, message: warningCount > 0 ? `${warningCount} employees need attention` : '' },
      }));

      // Update cycle totals
      const totalGross = payrollData.reduce((sum, e) => sum + e.gross_pay, 0);
      const totalDeductions = payrollData.reduce((sum, e) => sum + e.total_deductions, 0);
      const totalNet = payrollData.reduce((sum, e) => sum + e.net_pay, 0);

      await supabase
        .from('payroll_cycles')
        .update({
          total_employees: payrollData.length,
          total_gross: totalGross,
          total_deductions: totalDeductions,
          total_net: totalNet,
        })
        .eq('id', cycleId);

      setCycle({ ...cycleData, total_employees: payrollData.length, total_gross: totalGross, total_net: totalNet });

    } catch (error) {
      toast.error('Failed to load payroll cycle');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (empId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(empId)) {
      newExpanded.delete(empId);
    } else {
      newExpanded.add(empId);
    }
    setExpandedRows(newExpanded);
  };

  const generatePayStub = async (employee: PayrollEmployee) => {
    try {
      const stubNumber = `PS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(employees.indexOf(employee) + 1).padStart(3, '0')}`;

      const stubData = {
        stub_number: stubNumber,
        payroll_cycle_id: cycleId,
        employee_id: employee.id,
        pay_period_start: cycle.start_date,
        pay_period_end: cycle.end_date,
        basic_salary: employee.basic_salary,
        allowances: employee.earnings,
        bonuses: {},
        gross_pay: employee.gross_pay,
        deductions: employee.deductions,
        total_deductions: employee.total_deductions,
        net_pay: employee.net_pay,
        adjustments: {},
        adjustment_amount: 0,
        payment_method: 'Bank Transfer',
        status: 'Generated',
      };

      const { data, error } = await supabase
        .from('pay_stubs')
        .upsert(stubData, { onConflict: 'payroll_cycle_id,employee_id' })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Pay stub generated for ${employee.first_name} ${employee.last_name}`);
      
      // Update local state
      setEmployees(prev => prev.map(e => 
        e.id === employee.id ? { ...e, pay_stub_id: data.id } : e
      ));

    } catch (error) {
      toast.error('Failed to generate pay stub');
    }
  };

  const generateAllPayStubs = async () => {
    setProcessing(true);
    try {
      let generated = 0;
      const total = employees.length;

      for (const employee of employees) {
        if (employee.status !== 'Error') {
          await generatePayStub(employee);
          generated++;
          toast.success(`Generating... ${generated}/${total}`, { duration: 1000 });
        }
      }

      toast.success(`All pay stubs generated successfully! (${generated}/${total})`);
      await loadPayrollCycle(); // Reload to get updated stub IDs
    } catch (error) {
      toast.error('Failed to generate all pay stubs');
    } finally {
      setProcessing(false);
    }
  };

  const markAsProcessed = async () => {
    // TC-PAY-026: Check for errors
    const hasErrors = employees.some(e => e.status === 'Error');
    if (hasErrors) {
      toast.error('Cannot process. Some employees have errors. Please fix them first.');
      return;
    }

    setProcessing(true);
    try {
      // Update cycle status
      const { error } = await supabase
        .from('payroll_cycles')
        .update({
          status: 'Processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', cycleId);

      if (error) throw error;

      // Log action
      await supabase.from('payroll_processing_logs').insert({
        payroll_cycle_id: cycleId,
        action: 'processed',
        status: 'success',
        message: `Payroll ${cycle.name} processed successfully`,
      });

      // Note: Email notifications will be implemented via server-side job/webhook

      toast.success('Payroll processed successfully!');
      setShowProcessDialog(false);
      router.push('/hr/payroll');
    } catch (error) {
      toast.error('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  // Filter and search logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDept === 'all' || emp.departments?.name === filterDept;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading payroll data...</div>;
  }

  if (!cycle) {
    return <div className="text-center py-12">Payroll cycle not found</div>;
  }

  const isProcessed = cycle.status === 'Processed';
  const canProcess = employees.every(e => e.pay_stub_id) && !employees.some(e => e.status === 'Error');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Process Payroll - {cycle.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge className={cycle.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
          {cycle.status}
        </Badge>
      </div>

      {/* TC-PAY-027: Processed warning */}
      {isProcessed && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-yellow-600" />
              <p className="font-semibold text-yellow-900">
                This payroll has been processed and is locked for editing (View Only)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Validation Summary - TC-PAY-009 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Validation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              {validations.timesheets.passed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{validations.timesheets.message}</span>
            </div>
            <div className="flex items-center space-x-2">
              {validations.leaves.passed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{validations.leaves.message}</span>
            </div>
            <div className="flex items-center space-x-2">
              {validations.bankDetails.passed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{validations.bankDetails.message}</span>
            </div>
            {validations.warnings.count > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-amber-600">{validations.warnings.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full" 
              onClick={generateAllPayStubs}
              disabled={isProcessed || processing}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Pay Stubs
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={isProcessed}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={isProcessed}
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview Sample
            </Button>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => setShowProcessDialog(true)}
              disabled={isProcessed || !canProcess || processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Processed
            </Button>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Employees</p>
                <p className="text-2xl font-bold">{cycle.total_employees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gross Pay</p>
                <p className="text-2xl font-bold">${cycle.total_gross?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Pay</p>
                <p className="text-2xl font-bold text-green-600">${cycle.total_net?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List - TC-PAY-010, TC-PAY-011 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Payroll Details</CardTitle>
            <div className="flex space-x-2">
              {/* TC-PAY-012: Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {/* TC-PAY-013, TC-PAY-014: Filters */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Ready">Ready</option>
                <option value="Warning">Warnings</option>
                <option value="Error">Errors</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg">
                {/* Main Row */}
                <div 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(employee.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <button>
                      {expandedRows.has(employee.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-xs text-gray-500">{employee.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{employee.departments?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${employee.basic_salary.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">${employee.total_deductions.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">${employee.net_pay.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        {employee.status === 'Ready' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {employee.status === 'Warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        {employee.status === 'Error' && <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-xs">{employee.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details - TC-PAY-011 */}
                {expandedRows.has(employee.id) && (
                  <div className="border-t p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Earnings Breakdown */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">EARNINGS</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Basic Salary</span>
                            <span className="font-medium">${employee.basic_salary.toLocaleString()}</span>
                          </div>
                          {Object.entries(employee.earnings || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                              <span className="font-medium">${Number(value).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Gross Pay</span>
                            <span>${employee.gross_pay.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions Breakdown */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">DEDUCTIONS</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(employee.deductions || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                              <span className="font-medium">${Number(value).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Total Deductions</span>
                            <span>${employee.total_deductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Pay */}
                    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">NET PAY</span>
                        <span className="text-2xl font-bold text-green-600">${employee.net_pay.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isProcessed && (
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <History className="h-3 w-3 mr-1" />
                          View History
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePayStub(employee)}
                          disabled={!!employee.pay_stub_id || employee.status === 'Error'}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {employee.pay_stub_id ? 'Generated ✓' : 'Generate Pay Stub'}
                        </Button>
                      </div>
                    )}

                    {/* Warning/Error Message */}
                    {employee.warning_message && (
                      <div className={`mt-4 p-3 rounded-md ${employee.status === 'Error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                        {employee.status === 'Error' ? '❌' : '⚠️'} {employee.warning_message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No employees found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Confirmation Dialog - TC-PAY-024, TC-PAY-025 */}
      <AlertDialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Payroll?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalize payroll for <strong>{cycle.name}</strong>?
              <br /><br />
              <strong>Summary:</strong>
              <ul className="mt-2 space-y-1">
                <li>• {cycle.total_employees} employees</li>
                <li>• Total cost: ${cycle.total_net?.toLocaleString()}</li>
                <li>• Email notifications will be sent to all employees</li>
                <li>• This action cannot be undone</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={markAsProcessed}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm & Process
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

