import React, { useEffect } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { RouteComponentProps } from '@reach/router';

import { githubUrl } from '../components/about';
import { Window } from '../components/Window';

export function WelcomePage(props: RouteComponentProps) {
  const [url] = useQueryParam('url', StringParam);
  const [path] = useQueryParam('path', StringParam);

  const titleParts = [`GraphQL ‘98`];
  if (url) {
    titleParts.push(url);
  }
  if (path) {
    titleParts.push(path);
  }
  const title = titleParts.join(' - ');
  useEffect(() => {
    window.document.title = title;
  }, [title]);

  return (
    <Window title={title}>
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
