import { StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App.jsx';

// Used only by scripts/prerender.mjs (build time). Renders one route's
// markup with no browser/DOM APIs so it can run in plain Node.
export function render(path) {
  return renderToStaticMarkup(
    <StrictMode>
      <StaticRouter location={path}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>
  );
}
