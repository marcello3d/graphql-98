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
        {queryTypes ? (
          queryTypes.map(({ type, fields }) => (
            <li key={type}>
              <Link to={`/?${stringify({ url, type })}`}>🔗 {type}</Link>
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
          ))
        ) : (
          <i>None found</i>
        )}
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
