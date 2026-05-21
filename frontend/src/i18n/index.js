import fr from './fr.js';
import en from './en.js';
import ar from './ar.js';

const translations = { fr, en, ar };

export function t(lang, key) {
  const keys = key.split('.');
  let val = translations[lang] || translations.fr;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) break;
  }
  return val || key;
}

export const languages = [
  { code:'fr', label:'Français', dir:'ltr' },
  { code:'en', label:'English', dir:'ltr' },
  { code:'ar', label:'العربية', dir:'rtl' }
];
