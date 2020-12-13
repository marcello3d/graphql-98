import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { githubUrl } from '../components/about';
import { Window } from '../components/Window';
import { GraphQlWrapper } from '../components/GraphQlWrapper';

export function GraphQlPage({ url }: { url: string }) {
  return (
    <Window title={`Graph QL ‘98: ${url}`}>
      <GraphQlWrapper url={url} />
    </Window>
  );
}
