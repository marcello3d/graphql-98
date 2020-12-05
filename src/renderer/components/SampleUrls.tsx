import React from 'react';
import { Link } from '@reach/router';
import { stringify } from 'query-string';
import { EmojiIcon } from './EmojiIcon';

const sampleUrls: readonly {
  name: string;
  url: string;
  infoUrl: string;
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
    name: 'GraphQL hub',
    url: 'https://www.graphqlhub.com/graphql',
    infoUrl: 'https://www.graphqlhub.com/',
  },
  {
    name: 'GraphQL jobs',
    url: 'https://api.graphql.jobs',
    infoUrl: 'https://graphql.jobs/docs/api',
  },
  {
    name: 'GraphQL Pokemon',
    url: 'https://graphql-pokemon.now.sh',
    infoUrl: 'https://github.com/lucasbento/graphql-pokemon',
  },
  {
    name: 'HIVDB',
    url: 'https://hivdb.stanford.edu/graphql',
    infoUrl: 'https://hivdb.stanford.edu/page/webservice/',
  },
  {
    name: 'melodyRepo (Go dependency manager)',
    url: 'https://api.melody.sh/graphql',
    infoUrl: 'https://melody.sh/docs/api',
  },
  {
    name: 'Pokéapi (non-official)',
    url: 'https://pokeapi-graphiql.herokuapp.com/graphql',
    infoUrl: 'https://github.com/patrickshaughnessy/PokeAPI-GraphQL',
  },
  {
    name: 'The Rick and Morty API (non-official)',
    url: 'https://rickandmortyapi.com/graphql',
    infoUrl: 'https://rickandmortyapi.com/documentation/#graphql',
  },
  {
    name: 'SpaceX Land (non-official)',
    url: 'https://api.spacex.land/graphql/',
    infoUrl: 'https://spacex.land/',
  },
  {
    name: 'Star Wars API (non-official)',
    url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
    infoUrl: 'https://github.com/graphql/swapi-graphql',
  },
];

export function SampleUrls() {
  return (
    <ul className="tree-view">
      {sampleUrls.map(({ name, url, infoUrl }, index) => (
        <li key={index}>
          <b>
            <Link to={`?${stringify({ url })}`}>
              <EmojiIcon emoji="📊" label="GraphQL link" />
              {name}
            </Link>
          </b>
          : {url} —{' '}
          <a href={infoUrl}>
            <EmojiIcon emoji="ℹ️" label="info" /> info
          </a>
        </li>
      ))}
    </ul>
  );
}
