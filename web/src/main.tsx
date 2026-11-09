import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/instrument-sans';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/landing.css';
import './styles/app.css';
import App from './App';
import { createQuenchClient, QuenchProvider } from './client';
import { SourcesProvider } from './components/SourcesDrawer';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

createQuenchClient()
  .then((client) => {
    root.render(
      <StrictMode>
        <QuenchProvider client={client}>
          <BrowserRouter>
            <SourcesProvider>
              <App />
            </SourcesProvider>
          </BrowserRouter>
        </QuenchProvider>
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    root.render(
      <div className="boot-error" role="alert">
        <h1>The demo could not start.</h1>
        <p>{error instanceof Error ? error.message : 'Unknown client error.'}</p>
      </div>,
    );
  });