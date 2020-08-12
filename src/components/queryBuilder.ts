import { Restructure, SimpleField, TreeNode } from '../lib/restructure';
import { format } from 'graphql-formatter';

type QueryField = SimpleField & {
  children?: QueryField[];
};

export function buildQueryGraph(
  structure: Restructure,
  path: string[],
): {
  node: TreeNode;
  queryGraph: QueryField;
  fields: QueryField[];
} {
  let node = structure.queryType;
  let children: QueryField[] = [];

  const queryGraph: QueryField = {
    ...node.field,
    children,
  };

  for (let i = 1; i < path.length; i++) {
    const name = path[i];
    if (node.type !== 'container') {
      throw new Error(`unexpected ${node.type} in ${path.join('.')}`);
    }
    node = node.childMap[name];
    const newChildren: QueryField[] = [];
    children.push({ ...node.field, children: newChildren });
    children = newChildren;
    if (!node) {
      throw new Error(`invalid path item ${name} in ${path.join('.')}`);
    }
  }

  function recurse(node: TreeNode, children: QueryField[] = []): QueryField[] {
    if (node.type === 'collection' || node.type === 'container') {
      for (const field of node.fields) {
        const { name } = field;
        const child =
          node.type === 'container' ? node.childMap[name] : undefined;
        if (field.typeRef.kind !== 'OBJECT') {
          children.push(field);
        } else if (child) {
          const subChildren = recurse(child);
          if (subChildren.length > 0) {
            children.push({
              ...field,
              children: subChildren,
            });
          }
        }
      }
    }
    return children;
  }
  recurse(node, children);

  return { node, queryGraph, fields: children };
}

export function renderGraph(graph: QueryField) {
  let query = '';

  function recurse(graph: QueryField) {
    query += `${graph.name}`;
    if (graph.children && graph.children.length > 0) {
      query += `{\n`;
      for (const child of graph.children) {
        recurse(child);
      }
      query += `}`;
    }
    query += '\n';
  }
  recurse(graph);

  return format(query);
}
