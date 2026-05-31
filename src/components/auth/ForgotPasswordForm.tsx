import { useState } from 'react';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordForm({
  onBackToLogin,
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
        <Button onClick={onSuccess} className="w-full">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={loading || !email}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          <>
            Send Reset Link
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-gray-600 hover:text-black font-medium inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </button>
      </div>
    </form>
  );
}
