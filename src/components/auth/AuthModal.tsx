import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

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
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login'
              ? 'Sign in to access your account'
              : 'Join us and start shopping'}
          </p>
        </div>

        {mode === 'login' ? (
          <LoginForm
            onSuccess={onClose}
            onSignUpClick={() => setMode('signup')}
            onForgotPassword={() => {
              onClose();
            }}
          />
        ) : (
          <SignupForm
            onSuccess={onClose}
            onLoginClick={() => setMode('login')}
          />
        )}
      </div>
    </Modal>
  );
}
