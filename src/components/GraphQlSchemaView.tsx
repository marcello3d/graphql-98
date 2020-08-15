import React from 'react';

import { Restructure, RestructureField } from '../lib/restructure';
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
            <NodeItem field={structure.queryField} url={url} />
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
  if (field.requiredArgs > 0) {
    return <EmojiIcon emoji="✴️" label="function" />;
  }
  if (field.typeRef.type.fields.length > 0) {
    return <EmojiIcon emoji="🔡" label="container" />;
  }
  return <EmojiIcon emoji="❇️" label="value" />;
}

function NodeItem({
  url,
  field,
  path = [field.name],
}: {
  url: string;
  field: RestructureField;
  path?: string[];
}) {
  if (!field.show) {
    return null;
  }
  return (
    <li>
      <Link to={`/?${stringify({ url, path: path.join('.') })}`}>
        <NodeIcon field={field} /> <b>{field.name}</b>
      </Link>
      {field.args.length > 0 && <>({field.args.map(formatArg).join(', ')})</>}:{' '}
      {formatType(field.typeRef)}
      {field.showChildren && (
        <ul>
          {field.typeRef.type.fields.map((subField) => (
            <NodeItem
              key={subField.name}
              field={subField}
              url={url}
              path={[...path, subField.name]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
