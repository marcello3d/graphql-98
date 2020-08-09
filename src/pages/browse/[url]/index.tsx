import { getIntrospectionQuery } from 'graphql';

import styles from '../../../styles/Home.module.css';

import { formatType } from '../../../lib/restructure';
import Link from 'next/link';
import IntrospectionWrapper from '../../../components/IntrospectionWrapper';

export default function SchemaIndex() {
  return (
    <IntrospectionWrapper
      render={({ queryTypes, sortedTypes }) => (
        <>
          <h2>Queryable types</h2>
          <div className={styles.grid}>
            {queryTypes ? (
              queryTypes.map(({ type, fields }) => (
                <div className={styles.card} key={type}>
                  <h3>
                    <Link href={`${location.pathname}/${type}/`}>
                      <a>{type}</a>
                    </Link>
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
      )}
    />
  );
}
