import React from 'react';

import { formatType, Restructure } from '../lib/restructure';
import { Link } from '@reach/router';
import { stringify } from 'query-string';
import { StringParam, useQueryParam } from 'use-query-params';

export function GraphQlSchemaView({
  structure: { queryTypes, sortedTypes },
}: {
  structure: Restructure;
}) {
  const [url] = useQueryParam('url', StringParam);
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
      <h2>Types</h2>
      <table>
        <tbody>
          {sortedTypes.map((type) => (
            <tr key={type.name}>
              <td>{type.name}</td>
              <td>{type.kind}</td>
              <td>{type.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
