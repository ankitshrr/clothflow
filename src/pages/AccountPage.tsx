import { useState } from 'react';
import { User, Mail, Phone, Lock, Heart, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-transparent py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black mb-6 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Back to Store
          </Link>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase">My Account</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="mb-8 flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">
                  {getInitials()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-black truncate text-lg uppercase">{formData.full_name || 'My Profile'}</p>
                <p className="text-sm text-gray-500 truncate">{formData.email}</p>
              </div>
            </div>

            <nav className="space-y-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 py-2 transition-all duration-200 uppercase tracking-widest text-sm font-bold ${
                  activeTab === 'profile'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 py-2 transition-all duration-200 uppercase tracking-widest text-sm font-bold ${
                  activeTab === 'security'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 py-2 transition-all duration-200 uppercase tracking-widest text-sm font-bold ${
                  activeTab === 'wishlist'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 py-2 transition-all duration-200 uppercase tracking-widest text-sm font-bold ${
                  activeTab === 'addresses'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                Addresses
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-transparent">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-black uppercase">Personal Details</h2>
                  </div>

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
                    <AvatarUpload />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent font-bold text-black"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border-b-2 border-gray-200 bg-transparent text-gray-400 font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent font-bold text-black"
                        placeholder="+977 ..."
                      />
                    </div>

                    <div className="pt-6">
                      <Button type="submit" loading={loading} className="px-8 rounded-none border border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-widest text-xs py-3">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-black uppercase">Change Password</h2>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent font-bold text-black"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent font-bold text-black"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent font-bold text-black"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="pt-6">
                      <Button type="submit" loading={passwordLoading} className="px-8 rounded-none border border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-widest text-xs py-3">
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
