import React, { CSSProperties, Suspense } from 'react';

import './App.css';
import '98.css';
import './styles/98-vars.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { globalHistory, Router } from '@reach/router';
import { QueryParamProvider } from 'use-query-params';
import { AboutPage } from './pages/about';
import { IndexPage } from './pages';

const style: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
};
export function App() {
  return (
    <ErrorBoundary fallback={(error) => <div>App Error: {error.message}</div>}>
      <Suspense fallback={<div>Hold on</div>}>
        <QueryParamProvider reachHistory={globalHistory}>
          <Router style={style}>
            <IndexPage default />
            <AboutPage path="/about" />
          </Router>
        </QueryParamProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
