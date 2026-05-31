import { useState } from 'react';
import { User, Mail, Phone, Lock, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { WishlistTab, AddressesTab, AvatarUpload } from '../components/account';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export default function AccountPage() {
  const { profile, user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { updatePassword, signIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'wishlist' | 'addresses'>('profile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
    });

    setLoading(false);

    if (error) {
      showToast('Failed to update profile', 'error');
    } else {
      showToast('Profile updated successfully', 'success');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.oldPassword) {
      showToast('Please enter your old password', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (!user?.email) {
      showToast('Cannot verify old password without email', 'error');
      return;
    }

    setPasswordLoading(true);

    // Verify old password
    const { error: signInError } = await signIn(user.email, passwordData.oldPassword);

    if (signInError) {
      setPasswordLoading(false);
      showToast('Incorrect old password', 'error');
      return;
    }

    // If verified, update password
    const { error } = await updatePassword(passwordData.newPassword);

    setPasswordLoading(false);

    if (error) {
      showToast(error.message || 'Failed to update password', 'error');
    } else {
      showToast('Password updated successfully', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = () => {
    const name = formData.full_name || user.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account details and security preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black text-white rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                  {getInitials()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 truncate">{formData.full_name || 'My Profile'}</p>
                <p className="text-xs text-gray-500 truncate">{formData.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile Information</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security & Password</span>
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'wishlist'
                    ? 'bg-dark text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">My Wishlist</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'addresses'
                    ? 'bg-dark text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Saved Addresses</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your personal information and contact details.</p>
                  </div>

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
                    <AvatarUpload />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Email addresses cannot be changed directly.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" loading={loading} className="px-8 rounded-xl shadow-md hover:shadow-lg transition-all">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" loading={passwordLoading} className="px-8 rounded-xl shadow-md hover:shadow-lg transition-all">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && <WishlistTab />}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && <AddressesTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
