'use client';

import { updateProfile } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  personaOptions,
  personaPlaybooks,
  type PersonaKey,
} from '@/modules/onboarding/persona-guidance';

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey | ''>('');

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, code')
        .order('code');
      if (data) {
        setProducts(data);
      }
    }
    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('preferredProductId', selectedProduct);
    formData.set('assumedPersona', selectedPersona ?? '');

    console.log('Form data:', {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      assumedPersona: formData.get('assumedPersona'),
      preferredProductId: formData.get('preferredProductId'),
    });

    try {
      console.log('[CLIENT] Submitting profile update...');
      const result = await updateProfile(formData);
      console.log('[CLIENT] Update profile result:', result);
      
      if (!result.success) {
        const errorMsg = result.error || 'Failed to update profile';
        console.error('[CLIENT] Profile update failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // If we get here, success should have redirected
      console.log('[CLIENT] Profile updated successfully, waiting for redirect...');
      // Success will redirect via server action
    } catch (error) {
      // NEXT_REDIRECT is thrown by Next.js redirect() - this is EXPECTED, not an error
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        console.log('[CLIENT] Redirect triggered (expected) - going to dashboard');
        return;
      }
      
      // Only show actual errors
      console.error('[CLIENT] Unexpected profile update error:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your Guidewire training experience
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assumedPersona">Assumed Experience Level</Label>
              <Select
                value={selectedPersona}
                onValueChange={(value) => setSelectedPersona(value as PersonaKey)}
                required
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your target experience level" />
                </SelectTrigger>
                <SelectContent>
                  {personaOptions.map((persona) => (
                    <SelectItem key={persona} value={persona}>
                      {persona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This is the experience level you&apos;re aiming to achieve through training
              </p>
              {selectedPersona && personaPlaybooks[selectedPersona] && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-sm font-medium text-indigo-900">
                    {personaPlaybooks[selectedPersona].headline}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-indigo-800">
                    {personaPlaybooks[selectedPersona].steps.map((checkpoint) => (
                      <li key={checkpoint} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span>{checkpoint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredProduct">Preferred Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                required
                disabled={loading || products.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary focus" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can always learn other products later
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !selectedProduct || !selectedPersona}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

