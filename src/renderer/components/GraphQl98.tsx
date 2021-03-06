import React, { useEffect } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { RouteComponentProps } from '@reach/router';

import styles from './GraphQl98.module.css';
import { GraphQlUrlChooser } from './GraphQlUrlChooser';
import { githubUrl } from './about';

export function GraphQl98(props: RouteComponentProps) {
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
    <div className={styles.main}>
      <GraphQlUrlChooser />
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">About</div>
        </div>
        <footer className="window-body">
          Developed by <a href="https://marcello.cellosoft.com/">Marcello</a>{' '}
          for funsies. Source on <a href={githubUrl}>Github</a>
        </footer>
      </div>
    </div>
  );
}
