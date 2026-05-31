import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot-password';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="relative py-2">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 transition-colors p-2"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Sign in to access your account'}
            {mode === 'signup' && 'Join us and start shopping'}
            {mode === 'forgot-password' && 'Enter your email to get a reset link'}
          </p>
        </div>

        {mode === 'login' && (
          <LoginForm
            onSuccess={onClose}
            onSignUpClick={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}
        
        {mode === 'signup' && (
          <SignupForm
            onSuccess={onClose}
            onLoginClick={() => setMode('login')}
          />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSuccess={onClose}
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </Modal>
  );
}
