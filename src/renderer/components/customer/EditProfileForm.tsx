import React, { useState } from 'react';
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { useToast } from '@/renderer/components/ui/use-toast';

interface EditProfileFormProps {
  onCancel: () => void;
}

export function EditProfileForm({ onCancel }: EditProfileFormProps) {
  const { customer, updateCustomer } = useCustomerAuthStore();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(customer?.full_name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!customer) {
        throw new Error('Customer data not found.');
      }
      await updateCustomer({
        id: customer.id,
        full_name: fullName,
        email: email,
        phone: phone,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      onCancel();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
