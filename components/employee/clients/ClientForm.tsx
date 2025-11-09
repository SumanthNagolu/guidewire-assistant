'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface ClientFormProps {
  userId: string;
  client?: any;
}

export default function ClientForm({ userId, client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState(client?.name || '');
  const [industry, setIndustry] = useState(client?.industry || '');
  const [website, setWebsite] = useState(client?.website || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [status, setStatus] = useState(client?.status || 'active');
  const [tier, setTier] = useState(client?.tier || 'bronze');
  const [annualRevenue, setAnnualRevenue] = useState(client?.annual_revenue || '');
  const [employeeCount, setEmployeeCount] = useState(client?.employee_count || '');
  const [notes, setNotes] = useState(client?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const clientData = {
        name,
        industry: industry || null,
        website: website || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        status,
        tier,
        annual_revenue: annualRevenue ? parseInt(annualRevenue) : null,
        employee_count: employeeCount || null,
        notes: notes || null,
        owner_id: userId,
      };

      if (client) {
        const { error: updateError } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (updateError) throw updateError;
        
        setSuccess(true);
        setTimeout(() => router.push(`/employee/clients/${client.id}`), 1500);
      } else {
        const { error: insertError } = await supabase
          .from('clients')
          .insert([clientData]);

        if (insertError) throw insertError;

        setSuccess(true);
        setTimeout(() => router.push('/employee/clients'), 1500);
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      setError(err.message || 'Failed to save client. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-success-green-50 border-success-green-200">
        <AlertDescription className="text-success-green-700">
          ✓ Client {client ? 'updated' : 'added'} successfully! Redirecting...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
              placeholder="e.g. Acme Corporation"
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Insurance">Insurance</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="info@company.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="+1-555-123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              className="mt-1"
              rows={2}
              placeholder="Street address, city, state, ZIP"
            />
          </div>
        </div>
      </div>

      {/* Status & Classification */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Status & Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div>
            <Label htmlFor="tier">Client Tier *</Label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="platinum">💎 Platinum</option>
              <option value="gold">🥇 Gold</option>
              <option value="silver">🥈 Silver</option>
              <option value="bronze">🥉 Bronze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Company Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
            <Input
              id="annualRevenue"
              type="number"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
              placeholder="e.g. 5000000"
            />
          </div>
          <div>
            <Label htmlFor="employeeCount">Employee Count</Label>
            <select
              id="employeeCount"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="">Select Range</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501-1000">501-1000</option>
              <option value="1001-5000">1001-5000</option>
              <option value="5001+">5001+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          className="mt-1"
          rows={4}
          placeholder="Internal notes about this client..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-trust-blue hover:bg-trust-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>{client ? 'Update' : 'Add'} Client</>
          )}
        </Button>
      </div>
    </form>
  );
}

