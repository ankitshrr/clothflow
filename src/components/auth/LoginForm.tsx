import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSignUpClick,
  onForgotPassword,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Sign In
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onSignUpClick}
          className="text-gray-900 font-medium hover:underline"
        >
          Create account
        </button>
      </div>
    </form>
  );
}
