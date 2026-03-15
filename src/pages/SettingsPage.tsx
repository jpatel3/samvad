import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AccountSection } from '../components/settings/AccountSection';
import { AuthModal } from '../components/auth/AuthModal';
import type { Language, FontSize } from '../types';

const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'gu', label: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0' },
  { value: 'hi', label: '\u0939\u093F\u0928\u094D\u0926\u0940' },
];

const fontSizes: { value: FontSize; labelKey: 'small' | 'medium' | 'large' }[] = [
  { value: 'small', labelKey: 'small' },
  { value: 'medium', labelKey: 'medium' },
  { value: 'large', labelKey: 'large' },
];

export function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const fontSize = useAppStore((s) => s.settings.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text dark:text-text-dark">
        {t.settings.title}
      </h1>

      {/* Account */}
      <AccountSection onSignInClick={() => setShowAuthModal(true)} />

      {/* Language */}
      <Card>
        <p className="text-sm font-semibold text-text dark:text-text-dark mb-3">
          {t.settings.language}
        </p>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                language === lang.value
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <p className="text-sm font-semibold text-text dark:text-text-dark mb-3">
          {t.settings.theme}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark'
            }`}
          >
            {t.settings.light}
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark'
            }`}
          >
            {t.settings.dark}
          </button>
        </div>
      </Card>

      {/* Font Size */}
      <Card>
        <p className="text-sm font-semibold text-text dark:text-text-dark mb-3">
          {t.settings.fontSize}
        </p>
        <div className="flex gap-2">
          {fontSizes.map((fs) => (
            <button
              key={fs.value}
              onClick={() => setFontSize(fs.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                fontSize === fs.value
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark'
              }`}
            >
              {t.settings[fs.labelKey]}
            </button>
          ))}
        </div>
      </Card>

      {/* Reset Progress */}
      <Card>
        <Button
          variant="danger"
          onClick={() => setShowResetModal(true)}
          className="w-full"
        >
          {t.settings.resetProgress}
        </Button>
      </Card>

      {/* About */}
      <Card>
        <button
          onClick={() => navigate('/about')}
          className="w-full text-left"
        >
          <p className="text-sm font-semibold text-accent mb-1">
            {t.settings.aboutSamvad}
          </p>
          <p className="text-xs text-text-muted dark:text-text-muted-dark">
            Samvad v1.0.0
          </p>
        </button>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={t.settings.resetProgress}
      >
        <p className="text-sm text-text dark:text-text-dark mb-4">
          {t.settings.resetConfirm}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowResetModal(false)}
            className="flex-1"
          >
            {t.settings.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetProgress();
              setShowResetModal(false);
            }}
            className="flex-1"
          >
            {t.settings.reset}
          </Button>
        </div>
      </Modal>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
