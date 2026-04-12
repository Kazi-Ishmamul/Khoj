import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <I18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  );
} else {
  console.error(
    "Root element not found. Please ensure an element with id 'root' exists in the HTML."
  );
}
