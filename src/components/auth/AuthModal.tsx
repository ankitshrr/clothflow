import { useState } from 'react';
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
      <div className="py-2">
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
