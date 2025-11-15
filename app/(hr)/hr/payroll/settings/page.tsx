'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Edit, Trash2, Power, DollarSign, Percent, Hash } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  component_type: 'Earnings' | 'Deduction';
  calculation_method: 'Fixed' | 'PercentBase' | 'PercentGross' | 'Manual';
  default_value: number;
  percentage_value: number | null;
  description: string;
  is_active: boolean;
  display_order: number;
}

export default function PayrollSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [activeTab, setActiveTab] = useState('components');
  const [showDialog, setShowDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    component_type: 'Earnings' as 'Earnings' | 'Deduction',
    calculation_method: 'Fixed' as 'Fixed' | 'PercentBase' | 'PercentGross' | 'Manual',
    default_value: 0,
    percentage_value: null as number | null,
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('salary_components')
        .select('*')
        .order('component_type')
        .order('display_order');

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      toast.error('Failed to load salary components');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingComponent(null);
    setFormData({
      name: '',
      code: '',
      component_type: 'Earnings',
      calculation_method: 'Fixed',
      default_value: 0,
      percentage_value: null,
      description: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (component: SalaryComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      code: component.code,
      component_type: component.component_type,
      calculation_method: component.calculation_method,
      default_value: component.default_value,
      percentage_value: component.percentage_value,
      description: component.description || '',
      is_active: component.is_active,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const componentData = {
        name: formData.name,
        code: formData.code,
        component_type: formData.component_type,
        calculation_method: formData.calculation_method,
        default_value: formData.default_value,
        percentage_value: ['PercentBase', 'PercentGross'].includes(formData.calculation_method) 
          ? formData.percentage_value 
          : null,
        description: formData.description || null,
        is_active: formData.is_active,
        display_order: editingComponent?.display_order || components.length + 1,
      };

      if (editingComponent) {
        // TC-PAY-039: Update existing component
        const { error } = await supabase
          .from('salary_components')
          .update(componentData)
          .eq('id', editingComponent.id);

        if (error) throw error;
        toast.success('Salary component updated successfully');
      } else {
        // TC-PAY-038: Create new component
        const { error } = await supabase
          .from('salary_components')
          .insert(componentData);

        if (error) {
          if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
            toast.error('A component with this code already exists');
            return;
          }
          throw error;
        }
        toast.success('Salary component created successfully');
      }

      setShowDialog(false);
      loadComponents();
    } catch (error) {
      toast.error('Failed to save salary component');
    }
  };

  const toggleActiveStatus = async (component: SalaryComponent) => {
    // TC-PAY-040
    try {
      const { error } = await supabase
        .from('salary_components')
        .update({ is_active: !component.is_active })
        .eq('id', component.id);

      if (error) throw error;
      
      toast.success(`Component ${!component.is_active ? 'activated' : 'deactivated'}`);
      loadComponents();
    } catch (error) {
      toast.error('Failed to update component status');
    }
  };

  const earningsComponents = components.filter(c => c.component_type === 'Earnings');
  const deductionComponents = components.filter(c => c.component_type === 'Deduction');

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Fixed': return <DollarSign className="h-4 w-4" />;
      case 'PercentBase':
      case 'PercentGross': return <Percent className="h-4 w-4" />;
      case 'Manual': return <Hash className="h-4 w-4" />;
      default: return null;
    }
  };

  const getMethodDisplay = (component: SalaryComponent) => {
    switch (component.calculation_method) {
      case 'Fixed':
        return `$${component.default_value.toLocaleString()}`;
      case 'PercentBase':
        return `${component.percentage_value}% of Base`;
      case 'PercentGross':
        return `${component.percentage_value}% of Gross`;
      case 'Manual':
        return 'Manual Entry';
      default:
        return 'N/A';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Payroll Configuration</h1>
            <p className="text-gray-600 mt-1">
              Configure salary components, tax rates, and payroll settings
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - TC-PAY-036 */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('components')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'components'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Salary Components
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tax'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tax Rates
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Salary Components Tab - TC-PAY-037 */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* Earnings Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-700">Earnings Components</CardTitle>
                <Button onClick={openCreateDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Calculation</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Default Value</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsComponents.map((component) => (
                      <tr key={component.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{component.name}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">{component.code}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {getMethodIcon(component.calculation_method)}
                            <span className="text-sm">{component.calculation_method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {getMethodDisplay(component)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={component.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {component.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(component)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleActiveStatus(component)}
                            >
                              <Power className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Deduction Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-700">Deduction Components</CardTitle>
                <Button onClick={openCreateDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Calculation</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Default Value</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionComponents.map((component) => (
                      <tr key={component.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{component.name}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">{component.code}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {getMethodIcon(component.calculation_method)}
                            <span className="text-sm">{component.calculation_method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {getMethodDisplay(component)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={component.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {component.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(component)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleActiveStatus(component)}
                            >
                              <Power className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs */}
      {activeTab !== 'components' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">This section is under development</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Component Dialog - TC-PAY-038, TC-PAY-039 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? 'Edit Salary Component' : 'Create Salary Component'}
            </DialogTitle>
            <DialogDescription>
              Configure a salary component with calculation rules
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mobile Allowance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., MOBILE_ALLOW"
                  disabled={!!editingComponent}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.component_type}
                  onChange={(e) => setFormData({ ...formData, component_type: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="Earnings">Earnings</option>
                  <option value="Deduction">Deduction</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Calculation Method *</Label>
                <select
                  id="method"
                  value={formData.calculation_method}
                  onChange={(e) => setFormData({ ...formData, calculation_method: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="Fixed">Fixed Amount</option>
                  <option value="PercentBase">% of Basic Salary</option>
                  <option value="PercentGross">% of Gross Salary</option>
                  <option value="Manual">Manual Entry</option>
                </select>
              </div>
            </div>

            {formData.calculation_method === 'Fixed' && (
              <div className="space-y-2">
                <Label htmlFor="default_value">Default Value ($) *</Label>
                <Input
                  id="default_value"
                  type="number"
                  step="0.01"
                  value={formData.default_value}
                  onChange={(e) => setFormData({ ...formData, default_value: Number(e.target.value) })}
                  required
                />
              </div>
            )}

            {(formData.calculation_method === 'PercentBase' || formData.calculation_method === 'PercentGross') && (
              <div className="space-y-2">
                <Label htmlFor="percentage_value">Percentage (%) *</Label>
                <Input
                  id="percentage_value"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentage_value || ''}
                  onChange={(e) => setFormData({ ...formData, percentage_value: Number(e.target.value) })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this component"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Component is active
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingComponent ? 'Update Component' : 'Create Component'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

