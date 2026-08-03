import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'fr';

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      <button
        className={lang === 'fr' ? 'active' : ''}
        onClick={() => i18n.changeLanguage('fr')}
      >
        FR
      </button>
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}
