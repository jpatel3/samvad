import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'sign-in' | 'sign-up';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    resetForm();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      onClose();
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password);
      setMessage('Check your email to confirm your account, then sign in.');
      setTab('sign-in');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tab === 'sign-in' ? 'Sign In' : 'Create Account'}>
      {/* Tab Switcher */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => switchTab('sign-in')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'sign-in'
              ? 'bg-accent text-white'
              : 'text-text-muted dark:text-text-muted-dark'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => switchTab('sign-up')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'sign-up'
              ? 'bg-accent text-white'
              : 'text-text-muted dark:text-text-muted-dark'
          }`}
        >
          Create Account
        </button>
      </div>

      {message && (
        <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={tab === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-text-muted dark:text-text-muted-dark mb-1 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark placeholder:text-text-muted/50 dark:placeholder:text-text-muted-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted dark:text-text-muted-dark mb-1 uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tab === 'sign-up' ? 'At least 6 characters' : 'Your password'}
            autoComplete={tab === 'sign-up' ? 'new-password' : 'current-password'}
            className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark placeholder:text-text-muted/50 dark:placeholder:text-text-muted-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {tab === 'sign-up' && (
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-text-muted-dark mb-1 uppercase tracking-wide">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark placeholder:text-text-muted/50 dark:placeholder:text-text-muted-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2"
        >
          {loading
            ? 'Please wait...'
            : tab === 'sign-in'
              ? 'Sign In'
              : 'Create Account'}
        </Button>
      </form>
    </Modal>
  );
}
