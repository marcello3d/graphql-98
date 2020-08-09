import React, { Suspense } from 'react';

import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GraphQl98 } from './components/GraphQl98';
import { globalHistory, Router } from '@reach/router';
import { QueryParamProvider } from 'use-query-params';

export function App() {
  return (
    <ErrorBoundary fallback={(error) => <div>Oh noes</div>}>
      <Suspense fallback={<div>Hold on</div>}>
        <QueryParamProvider reachHistory={globalHistory}>
          <Router>
            <GraphQl98 default />
          </Router>
        </QueryParamProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
