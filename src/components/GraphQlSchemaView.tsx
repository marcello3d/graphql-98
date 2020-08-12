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
import { EmojiIcon } from './EmojiIcon';

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

function NodeIcon({ node }: { node: TreeNode }) {
  if (node.collection) {
    return <EmojiIcon emoji="🛄" label="collection" />;
  }
  if (node.requiredArgs.length > 0) {
    return <EmojiIcon emoji="✴️" label="function" />;
  }
  if (node.children.length > 0) {
    return <EmojiIcon emoji="🔡" label="container" />;
  }
  return <EmojiIcon emoji="❇️" label="value" />;
}

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
  if (!node.show) {
    return null;
  }
  return (
    <li>
      <Link to={`/?${stringify({ url, path: path.join('.') })}`}>
        <NodeIcon node={node} /> <b>{name}</b>
      </Link>
      {args.length > 0 && <>({args.map(formatArg).join(', ')})</>}:{' '}
      {formatType(typeRef)}
      {node.showChildren && (
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
