import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your name has been updated successfully.",
      });

      // Trigger a page reload to refresh the profile data
      window.location.reload();
    } catch (error: unknown) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const createdAt = user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown';

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold font-display">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your name"
            className="input-field w-full"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address
          </label>
          <div className="input-field w-full bg-muted/50 text-muted-foreground cursor-not-allowed">
            {user?.email || 'Not available'}
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        {/* Account Created */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Member Since
          </label>
          <div className="input-field w-full bg-muted/50 text-muted-foreground cursor-not-allowed">
            {createdAt}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isUpdating || fullName.trim() === profile?.full_name}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};
