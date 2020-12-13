import React, { useEffect, useState, Fragment } from 'react';
import { stringify } from 'query-string';
import { EmojiIcon } from './EmojiIcon';

type Api = {
  url: string;
  info: {
    title: string;
    description: string;
    logo?: {
      url: string;
      backgroundColor?: string;
    };
  };
  security?: {
    title: string;
    description: string;
    type: string;
    prefix: string;
    name: string;
    in: string;
  }[];
  externalDocs: {
    description: string;
    url: string;
  }[];
};

const apiJsonPromise: Promise<
  Api[]
> = fetch(
  'https://raw.githubusercontent.com/APIs-guru/graphql-apis/master/apis.json',
  { cache: 'force-cache' },
).then((response) => response.json());
const proxyJsonPromise: Promise<
  Api[]
> = fetch(
  'https://raw.githubusercontent.com/APIs-guru/graphql-apis/master/proxies.json',
  { cache: 'force-cache' },
).then((response) => response.json());

const result = Promise.all([apiJsonPromise, proxyJsonPromise]).then(
  async ([apis, proxies]) => {
    return [...apis, ...proxies]
      .filter(({ security }) => !security?.length)
      .sort((a, b) => (a.info.title < b.info.title ? -1 : 1));
  },
);

export function GithubSampleUrls() {
  const [apis, setApis] = useState<Api[] | undefined>();
  useEffect(() => {
    let unmounted = false;
    result.then((apis) => {
      if (!unmounted) {
        setApis(apis);
      }
    });
    return () => {
      unmounted = true;
    };
  }, []);
  return (
    <ul className="tree-view">
      {apis?.map(
        ({ url, info: { title, description, logo }, externalDocs }, index) => (
          <li key={index}>
            <b>
              <a
                href={`${location.pathname}?${stringify({ url })}`}
                target="_blank"
              >
                <EmojiIcon emoji="📊" label="GraphQL link" />
                {title}
              </a>
            </b>
            : {url}
            {externalDocs?.length > 0 && (
              <>
                {' '}
                {externalDocs.map(({ url, description }) => (
                  <Fragment key={url}>
                    —{' '}
                    <a href={url} target="_blank">
                      <EmojiIcon emoji="ℹ️" label="info" /> {description}
                    </a>
                  </Fragment>
                ))}
              </>
            )}
          </li>
        ),
      ) ?? 'Loading sample urls from github…'}
    </ul>
  );
}
