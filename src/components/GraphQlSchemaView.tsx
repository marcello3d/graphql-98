import React from 'react';

import {
  Restructure,
  RestructureField,
  RestructureQuery,
} from '../lib/restructure';
import { Link } from '@reach/router';
import { stringify } from 'query-string';
import { GraphvizGraph } from './GraphvizGraph';
import { computeGraph } from './schemaToGraphviz';
import { EmojiIcon } from './EmojiIcon';
import { formatArg, formatType } from '../lib/restructureFormatters';

export function GraphQlSchemaView({
  url,
  structure,
}: {
  url: string;
  structure: Restructure;
}) {
  const graph = computeGraph(structure);
  return (
    <>
      <ul className="tree-view">
        <li>
          <EmojiIcon emoji="🗃" label="root" /> {url}
          <ul>
            <NodeItem query={structure.query} url={url} />
            {/*<LookupList structure={structure} />*/}
          </ul>
        </li>
      </ul>
      <GraphvizGraph graph={graph} />
    </>
  );
}

function NodeIcon({ field }: { field: RestructureField }) {
  if (field.collection) {
    return <EmojiIcon emoji="🛄" label="collection" />;
  }
  if (field.args.length > 0) {
    return <EmojiIcon emoji="✴️" label="function" />;
  }
  if (field.typeRef.type.fields.length > 0) {
    return <EmojiIcon emoji="🔡" label="container" />;
  }
  return <EmojiIcon emoji="❇️" label="value" />;
}

function NodeItem({
  url,
  query: { field, path, lookupArgs, children },
}: {
  url: string;
  query: RestructureQuery;
}) {
  return (
    <li>
      <Link to={`/?${stringify({ url, path: path.join('.') })}`}>
        {lookupArgs && <EmojiIcon emoji="🆔️" label="function" />}
        <NodeIcon field={field} /> <b>{field.name}</b>
      </Link>
      {field.args.length > 0 && <>({field.args.map(formatArg).join(', ')})</>}:{' '}
      {formatType(field.typeRef)}
      {children && (
        <ul>
          {children.map((subQuery) => (
            <NodeItem key={subQuery.field.name} query={subQuery} url={url} />
          ))}
        </ul>
      )}
    </li>
  );
}
