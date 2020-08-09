import React from 'react';

import { formatType, Restructure } from '../lib/restructure';

export function GraphqlSchemaView({
  structure: { queryTypes, sortedTypes },
}: {
  structure: Restructure;
}) {
  return (
    <>
      <h2>Queryable types</h2>
      <div>
        {queryTypes ? (
          queryTypes.map(({ type, fields }) => (
            <div key={type}>
              <h3>
                <a href={`${window.location.href}&type=${type}`}>{type}</a>
              </h3>
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
            </div>
          ))
        ) : (
          <i>None found</i>
        )}
      </div>
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
