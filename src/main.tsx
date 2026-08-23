import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
    <App />
  </StrictMode>,
);

