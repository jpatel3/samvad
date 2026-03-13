import { Modal } from '../common/Modal';
import { CharacterAvatar } from '../decorative/CharacterAvatar';
import type { CharacterBio } from '../../constants/characterBios';

interface CharacterBioModalProps {
  bio: CharacterBio | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterBioModal({ bio, isOpen, onClose }: CharacterBioModalProps) {
  if (!bio) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <CharacterAvatar name={bio.name} size={52} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text dark:text-text-dark">{bio.name}</h3>
          <p className="text-sm font-semibold text-accent">{bio.role}</p>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark p-1"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-text dark:text-text-dark leading-relaxed mb-4">
        {bio.bio}
      </p>

      {(bio.nameGu || bio.nameHi) && (
        <div className="border-t border-border dark:border-border-dark pt-3 space-y-1">
          {bio.nameGu && (
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              ગુજરાતી: {bio.nameGu}
            </p>
          )}
          {bio.nameHi && (
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              हिन्दी: {bio.nameHi}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
