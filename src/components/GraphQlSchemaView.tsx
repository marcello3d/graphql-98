import React from 'react';

import {
  formatArg,
  formatType,
  Restructure,
  TreeNode,
} from '../lib/restructure';
import { Link } from '@reach/router';
import { stringify } from 'query-string';
import { GraphvizGraph } from './GraphvizGraph';
import { computeGraph } from './schemaToGraphviz';

export function GraphQlSchemaView({
  url,
  structure,
}: {
  url: string;
  structure: Restructure;
}) {
  const { queryType } = structure;
  const graph = computeGraph(structure);
  return (
    <>
      <ul className="tree-view">
        <li>
          <EmojiIcon emoji="🗃" label="root" /> {url}
          <ul>
            <NodeItem node={queryType} url={url} />
          </ul>
        </li>
      </ul>
      <GraphvizGraph graph={graph} />
    </>
  );
}

const icons = {
  function: '✴️',
  collection: '🛄',
  container: '🔡',
  value: '❇️',
};

function NodeItem({
  url,
  node,
  path = [node.field.name],
}: {
  url: string;
  node: TreeNode;
  path?: string[];
}) {
  const { typeRef, args, name } = node.field;
  return (
    <li>
      <Link to={`/?${stringify({ url, path: path.join('.') })}`}>
        <EmojiIcon emoji={icons[node.type]} label={node.type} /> <b>{name}</b>
      </Link>
      {args.length > 0 && <>({args.map(formatArg).join(', ')})</>}:{' '}
      {formatType(typeRef)}
      {node.type === 'container' && (
        <ul>
          {node.children.map((child) => (
            <NodeItem
              key={child.field.name}
              node={child}
              url={url}
              path={[...path, child.field.name]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function EmojiIcon({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span role="img" aria-label={`${label} icon`}>
      {emoji}
    </span>
  );
}
