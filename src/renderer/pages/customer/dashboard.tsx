import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store';
import { Button } from '@/renderer/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/renderer/components/ui/use-toast';
import { useState } from 'react';
import { EditProfileForm } from '@/renderer/components/customer/EditProfileForm';

export function CustomerDashboard() {
  const { customer, signOut } = useCustomerAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {customer?.full_name}</p>
      </div>

      {isEditing ? (
        <EditProfileForm onCancel={handleCancelEdit} />
      ) : (
        <div className="grid gap-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-2 font-semibold">Account Balance</h2>
            <p className="text-2xl font-bold">${customer?.balance.toFixed(2)}</p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-2 font-semibold">Quick Actions</h2>
            <div className="grid gap-2">
              <Button variant="outline" onClick={() => navigate('/customer/sessions')}>
                View Active Sessions
              </Button>
              <Button variant="outline" onClick={() => navigate('/customer/orders')}>
                View Orders
              </Button>
              <Button variant="outline" onClick={handleEditProfile}>
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
