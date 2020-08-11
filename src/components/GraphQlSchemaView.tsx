import React from 'react';

import { formatType, Restructure } from '../lib/restructure';
import { Link } from '@reach/router';
import { stringify } from 'query-string';
import { StringParam, useQueryParam } from 'use-query-params';
import { GraphvizGraph } from './GraphvizGraph';
import { computeGraph } from './schemaToGraphviz';

export function GraphQlSchemaView({ structure }: { structure: Restructure }) {
  const [url] = useQueryParam('url', StringParam);
  const { queryTypes } = structure;
  const graph = computeGraph(structure);
  return (
    <>
      <ul className="tree-view">
        <li>
          <span role="img" aria-label="link icon">
            🗃
          </span>{' '}
          Collection types
          <ul>
            {queryTypes
              .filter((t) => t.collectionFields.length > 0)
              .map(({ type, collectionFields, fields }) => (
                <li key={type}>
                  <Link to={`/?${stringify({ url, type })}`}>
                    <span role="img" aria-label="link icon">
                      🔗
                    </span>{' '}
                    {type}
                  </Link>
                  <ul>
                    {fields.map(({ name, args, type }) => (
                      <li key={name}>
                        {name} (
                        {args
                          .map(
                            ({ name, type, defaultValue }) =>
                              `${name}: ${formatType(type)}`,
                          )
                          .join(', ')}
                        ): {formatType(type)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </li>
        <li>
          <span role="img" aria-label="link icon">
            🗃
          </span>{' '}
          Other types <i>(currently unsupported!)</i>
          <ul>
            {queryTypes
              .filter((t) => t.collectionFields.length === 0)
              .map(({ type, collectionFields, fields }) => (
                <li key={type}>
                  <Link to={`/?${stringify({ url, type })}`}>
                    <span role="img" aria-label="link icon">
                      🔗
                    </span>{' '}
                    {type}
                  </Link>
                  <ul>
                    {fields.map(({ name, args, type }) => (
                      <li key={name}>
                        {name} (
                        {args
                          .map(
                            ({ name, type, defaultValue }) =>
                              `${name}: ${formatType(type)}`,
                          )
                          .join(', ')}
                        ): {formatType(type)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </li>
      </ul>
      <GraphvizGraph graph={graph} />
    </>
  );
}
