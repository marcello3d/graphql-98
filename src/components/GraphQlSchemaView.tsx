import React from 'react';

import {
  Restructure,
  RestructureField,
  RestructureLookup,
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
            <NodeItem field={structure.queryField} url={url} />
            <LookupList structure={structure} />
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
  const subFields = field.typeRef.type.fields;
  if (subFields.length === 0 || path.length > 10) {
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
          {subFields.map((subField) => (
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

function LookupList({ structure }: { structure: Restructure }) {
  const typeQueryTypes = Object.keys(structure.typeQueries);
  if (!typeQueryTypes.length) {
    return null;
  }
  return (
    <li>
      Lookup query functions by type
      <ul>
        {typeQueryTypes.map((type) => (
          <li>
            <EmojiIcon emoji="✴️" label="function" />
            <b>{type}</b> via
            {structure.typeQueries[type].length === 1 ? (
              <LookupFn lookup={structure.typeQueries[type][0]} />
            ) : (
              <ul>
                {structure.typeQueries[type].map((lookup) => (
                  <li key={lookup.queryField.name}>
                    <LookupFn lookup={lookup} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}

function LookupFn({
  lookup: { path, queryField, matchedArgs },
}: {
  lookup: RestructureLookup;
}) {
  return (
    <>
      {path.join('.')} <b>{queryField.name}</b>(
      {matchedArgs.map(formatArg).join(', ')})
    </>
  );
}
