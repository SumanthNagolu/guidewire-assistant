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
import { DollarSign, Plus, Trash2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface ExpenseItem {
  expense_category_id: string;
  expense_date: string;
  amount: number;
  description: string;
  receipt_file?: File;
}
export default function NewExpenseClaimPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    {
      expense_category_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
    },
  ]);
  const [claimDescription, setClaimDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: emp } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setEmployee(emp);
    const { data: cats } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setCategories(cats || []);
  };
  const addExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      {
        expense_category_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
      },
    ]);
  };
  const removeExpenseItem = (index: number) => {
    if (expenseItems.length === 1) {
      alert('You must have at least one expense item');
      return;
    }
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };
  const updateExpenseItem = (index: number, field: keyof ExpenseItem, value: any) => {
    const updated = [...expenseItems];
    updated[index] = { ...updated[index], [field]: value };
    setExpenseItems(updated);
  };
  const handleFileChange = (index: number, file: File) => {
    updateExpenseItem(index, 'receipt_file', file);
  };
  const calculateTotalAmount = () => {
    return expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validate all items
      for (const item of expenseItems) {
        if (!item.expense_category_id || !item.expense_date || item.amount <= 0) {
          setError('Please fill in all required fields for each expense item');
          setLoading(false);
          return;
        }
      }
      // Generate claim number
      const claimNumber = `EXP${Date.now()}`;
      const totalAmount = calculateTotalAmount();
      // Create expense claim
      const { data: claim, error: claimError } = await supabase
        .from('expense_claims')
        .insert({
          employee_id: employee.id,
          claim_number: claimNumber,
          claim_date: new Date().toISOString().split('T')[0],
          total_amount: totalAmount,
          currency: 'USD',
          description: claimDescription,
          status: 'Draft',
        })
        .select()
        .single();
      if (claimError) throw claimError;
      // Upload receipts and create expense items
      for (const item of expenseItems) {
        let receiptUrl = null;
        // Upload receipt if provided
        if (item.receipt_file) {
          const fileName = `${employee.id}/${claimNumber}/${Date.now()}_${item.receipt_file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('expense-receipts')
            .upload(fileName, item.receipt_file);
          if (uploadError) {
            } else {
            const { data: publicUrlData } = supabase.storage
              .from('expense-receipts')
              .getPublicUrl(fileName);
            receiptUrl = publicUrlData.publicUrl;
          }
        }
        // Create expense item
        const { error: itemError } = await supabase
          .from('expense_items')
          .insert({
            expense_claim_id: claim.id,
            expense_category_id: item.expense_category_id,
            expense_date: item.expense_date,
            amount: item.amount,
            description: item.description,
            receipt_url: receiptUrl,
          });
        if (itemError) throw itemError;
      }
      // Submit the claim
      await supabase
        .from('expense_claims')
        .update({ status: 'Submitted' })
        .eq('id', claim.id);
      setSuccess(true);
      setTimeout(() => {
        router.push('/hr/expenses/claims');
      }, 2000);
    } catch (err) {
      setError('Failed to submit expense claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const totalAmount = calculateTotalAmount();
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Expense Claim</h1>
        <p className="text-gray-600 mt-1">Submit your business expenses for reimbursement</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claim Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Expense claim submitted successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}
        {/* Claim Description */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <CardDescription>Provide an overall description for this claim</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Business trip to New York - Client meeting..."
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
        {/* Expense Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Expense Items</CardTitle>
                <CardDescription>Add individual expense items with receipts</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExpenseItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {expenseItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Item #{index + 1}</h3>
                  {expenseItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpenseItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={item.expense_category_id}
                      onValueChange={(value) => 
                        updateExpenseItem(index, 'expense_category_id', value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={item.expense_date}
                      onChange={(e) => 
                        updateExpenseItem(index, 'expense_date', e.target.value)
                      }
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount || ''}
                      onChange={(e) => 
                        updateExpenseItem(index, 'amount', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Upload</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(index, file);
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                    {item.receipt_file && (
                      <p className="text-xs text-green-600">
                        ✓ {item.receipt_file.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => 
                        updateExpenseItem(index, 'description', e.target.value)
                      }
                      placeholder="e.g., Taxi from airport to hotel"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || totalAmount === 0}>
            {loading ? 'Submitting...' : 'Submit Expense Claim'}
          </Button>
        </div>
      </form>
    </div>
  );
}
