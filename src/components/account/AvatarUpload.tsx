import { useState, useRef } from 'react';
import { Upload, X, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';

export function AvatarUpload() {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    const name = profile?.full_name || user?.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      if (!user) {
        throw new Error('User not logged in');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await updateProfile({
        avatar_url: data.publicUrl
      });

      if (updateError) {
        throw updateError;
      }

      showToast('Avatar updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      
      // Optional: Delete from storage if you want, but updating profile to empty string is enough for UI
      const { error } = await updateProfile({
        avatar_url: ''
      });

      if (error) throw error;
      showToast('Avatar removed', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-inner border-2 border-white">
            {getInitials()}
          </div>
        )}

        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-medium bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
          >
            {uploading ? 'Uploading...' : 'Change Picture'}
          </button>

          {profile?.avatar_url && (
            <button
              onClick={removeAvatar}
              disabled={uploading}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        accept="image/jpeg, image/png, image/webp, image/gif"
        className="hidden"
      />
    </div>
  );
}
