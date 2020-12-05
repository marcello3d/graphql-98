import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { githubUrl } from '../components/about';
import { Window } from '../components/Window';

export function AboutPage(_: RouteComponentProps) {
  return (
    <Window title="Graph QL ‘98">
      Developed by{' '}
      <a href="https://marcello.cellosoft.com/" target="_blank">
        Marcello
      </a>{' '}
      for funsies. Source on{' '}
      <a href={githubUrl} target="_blank">
        Github
      </a>
    </Window>
  );
}
