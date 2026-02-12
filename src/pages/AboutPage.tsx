import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { useLanguage } from '../hooks/useLanguage';
import { AppDownloadBanner } from '../components/home/AppDownloadBanner';

export function AboutPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-accent hover:text-accent/80 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text dark:text-text-dark">
          {t.about.title}
        </h1>
      </div>

      {/* The Name */}
      <Card>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
          The Name
        </p>
        <p className="text-3xl font-bold text-text dark:text-text-dark mb-1">
          Samvad
        </p>
        <p className="text-lg text-text-muted dark:text-text-muted-dark mb-3">
          /sam-vaad/ &mdash; Sanskrit
        </p>
        <p className="text-sm text-text dark:text-text-dark leading-relaxed">
          <strong>Samvad</strong> (&#x0938;&#x0902;&#x0935;&#x093E;&#x0926;) means <em>dialogue</em> or <em>conversation</em> in Sanskrit. It refers not to casual talk, but to a meaningful exchange of wisdom between teacher and student &mdash; the very format through which India's greatest spiritual texts were revealed.
        </p>
      </Card>

      {/* Why Samvad */}
      <Card>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
          Why This Name
        </p>
        <p className="text-sm text-text dark:text-text-dark leading-relaxed mb-3">
          The scriptures on Samvad share a profound commonality: they are all structured as dialogues between God and His devotees.
        </p>
        <div className="space-y-3">
          <div className="border-l-2 border-accent pl-3">
            <p className="text-sm font-semibold text-text dark:text-text-dark">Vachanamrut</p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              273 discourses between Bhagwan Swaminarayan and His paramhansas &mdash; questions asked by saints, answers given by Maharaj in the assemblies of Gadhada, Sarangpur, and other places.
            </p>
          </div>
          <div className="border-l-2 border-accent/50 pl-3">
            <p className="text-sm font-semibold text-text dark:text-text-dark">
              Bhagavad Gita
              <span className="text-[10px] ml-2 bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-text-muted-dark px-1.5 py-0.5 rounded-full">Coming Soon</span>
            </p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              700 verses of divine dialogue between Lord Krishna and Arjuna on the battlefield of Kurukshetra &mdash; answering the deepest questions about duty, devotion, and the nature of the self.
            </p>
          </div>
        </div>
      </Card>

      {/* The Philosophy */}
      <Card>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
          The Practice
        </p>
        <p className="text-sm text-text dark:text-text-dark leading-relaxed mb-3">
          Samvad is built on a simple idea: <strong>ten minutes of daily spiritual reading</strong> can transform your understanding over time.
        </p>
        <p className="text-sm text-text dark:text-text-dark leading-relaxed mb-3">
          Each scripture is broken into focused, digestible readings. You read one passage each day, test your understanding with a quiz, and track your progress as you journey through the complete text.
        </p>
        <p className="text-sm text-text dark:text-text-dark leading-relaxed">
          Just as the saints asked questions and received answers in these assemblies, Samvad invites you to engage in that same dialogue &mdash; to read, reflect, and return each day.
        </p>
      </Card>

      {/* How It Works */}
      <Card>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
          How It Works
        </p>
        <div className="space-y-2">
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm text-text dark:text-text-dark">Choose a scripture track and read today's passage in your preferred language.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm text-text dark:text-text-dark">Take a short quiz to reinforce the key teachings.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm text-text dark:text-text-dark">Build your streak, earn XP, and watch your progress grow.</p>
          </div>
        </div>
      </Card>

      <AppDownloadBanner />

      <div className="text-center py-4">
        <p className="text-sm text-text-muted dark:text-text-muted-dark italic">
          "Samvad is the bridge between the wisdom of the past and the seeker of today."
        </p>
      </div>
    </div>
  );
}
