import React from 'react';
import { Link } from '@reach/router';
import { stringify } from 'query-string';

const sampleUrls: readonly { name: string; url: string }[] = [
  { name: 'Artsy', url: 'https://metaphysics-production.artsy.net' },
  {
    name: 'Countries (trevorblades.com)',
    url: 'https://countries.trevorblades.com',
  },
  {
    name: 'Countries 2 (lennertVanSever)',
    url: 'https://countries-274616.ew.r.appspot.com/',
  },
  {
    name: 'GraphQL jobs',
    url: 'https://api.graphql.jobs',
  },
  // Not working yet:
  // {
  //   name: 'Ethiopian Movie Database',
  //   url: 'https://etmdb.com/graphql',
  // },
];

export function SampleUrls() {
  return (
    <>
      <ul className="tree-view">
        {sampleUrls.map(({ name, url }, index) => (
          <li key={index}>
            <Link to={`/?${stringify({ url })}`}>{name}</Link>: {url}
          </li>
        ))}
      </ul>

      <div>
        Courtesy of{' '}
        <a href="https://github.com/APIs-guru/graphql-apis">APIs-guru</a>
      </div>
    </>
  );
}
