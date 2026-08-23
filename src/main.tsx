import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PrivacyPolicyPage} from './components/PrivacyPolicyPage.tsx';
import './index.css';

// Standalone route so /privacy (or #privacy, which works with no server
// config at all) resolves on a fresh load — Play Store's privacy policy
// link must be visitable directly, not just reachable from in-app nav.
const isPrivacyRoute =
  window.location.pathname.replace(/\/+$/, '') === '/privacy' ||
  window.location.hash.replace('#', '') === 'privacy';

// Globally prevent mouse wheel scrolling on number inputs from accidentally changing values
document.addEventListener(
  'wheel',
  (event) => {
    const activeEl = document.activeElement;
    const target = event.target as HTMLElement | null;

    if (
      (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') ||
      (activeEl instanceof HTMLInputElement && activeEl.type === 'number' && activeEl === target)
    ) {
      if (document.activeElement === target) {
        (target as HTMLInputElement).blur();
      }
      event.preventDefault();
    }
  },
  { passive: false }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPrivacyRoute ? <PrivacyPolicyPage /> : <App />}
  </StrictMode>,
);

