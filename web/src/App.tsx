import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { SimulatedBadge } from './components/SimulatedBadge';

const Landing = lazy(() => import('./pages/Landing'));
const AppShell = lazy(() => import('./components/AppShell').then((module) => ({ default: module.AppShell })));
const Overview = lazy(() => import('./pages/Overview'));
const Basin = lazy(() => import('./pages/Basin'));
const Borrow = lazy(() => import('./pages/Borrow'));
const Wellspring = lazy(() => import('./pages/Wellspring'));
const Confluence = lazy(() => import('./pages/Confluence'));
const Activity = lazy(() => import('./pages/Activity'));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__mark">quench</span>
      <span>Loading the instrument…</span>
    </div>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <SimulatedBadge />
      <h1>404</h1>
      <p>This valve does not exist.</p>
      <Link to="/" className="text-link">
        Back to the story
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="basin" element={<Basin />} />
          <Route path="loans" element={<Borrow />} />
          <Route path="positions" element={<Wellspring />} />
          <Route path="swap" element={<Confluence />} />
          <Route path="activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}