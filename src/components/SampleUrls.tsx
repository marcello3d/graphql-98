import React from 'react';
import { Link } from '@reach/router';
import { stringify } from 'query-string';

const sampleUrls: readonly {
  name: string;
  url: string;
  infoUrl?: string;
  working?: boolean;
}[] = [
  {
    name: 'Artsy',
    url: 'https://metaphysics-production.artsy.net',
    infoUrl: 'https://github.com/artsy/metaphysics',
  },
  {
    name: 'Countries (trevorblades.com)',
    url: 'https://countries.trevorblades.com',
    infoUrl: 'https://github.com/trevorblades/countries',
  },
  {
    name: 'Countries 2 (lennertVanSever)',
    url: 'https://countries-274616.ew.r.appspot.com/',
    infoUrl: 'https://github.com/lennertVanSever/graphcountries',
  },
  {
    name: 'GraphQL jobs',
    url: 'https://api.graphql.jobs',
    infoUrl: 'https://graphql.jobs/docs/api',
  },
  {
    name: 'HIVDB',
    url: 'https://hivdb.stanford.edu/graphql',
    infoUrl: 'https://hivdb.stanford.edu/page/webservice/',
  },
  {
    name: 'SpaceX Land (non-official)',
    url: 'https://api.spacex.land/graphql/',
    infoUrl: 'https://spacex.land/',
  },
  // Not working yet:
  {
    name: 'Ethiopian Movie Database',
    url: 'https://etmdb.com/graphql',
    working: false,
  },
  {
    name: 'melodyRepo (Go dependency manager)',
    url: 'https://api.melody.sh/graphql',
    infoUrl: 'https://melody.sh/docs/api',
    working: false,
  },
  {
    name: 'Pokéapi (non-official)',
    url: 'https://pokeapi-graphiql.herokuapp.com/graphql',
    working: false,
  },
  {
    name: 'Star Wars API (non-official)',
    url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
    infoUrl: 'https://github.com/graphql/swapi-graphql',
    working: false,
  },
];

export function SampleUrls() {
  return (
    <>
      <ul className="tree-view">
        {sampleUrls.map(({ name, url, infoUrl, working = true }, index) => (
          <li key={index}>
            {!working && <i>(currently unsupported)</i>}{' '}
            <b>
              <Link to={`/?${stringify({ url })}`}>{name}</Link>
            </b>
            : {url}
            {infoUrl && (
              <>
                (<a href={infoUrl}>info</a>)
              </>
            )}
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
