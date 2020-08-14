import { Restructure, SimpleField, TreeNode } from '../lib/restructure';
import { format } from 'graphql-formatter';

export type QueryField = SimpleField & {
  disabled?: boolean;
  children?: QueryField[];
};

type Fields = (string | { [key: string]: Fields })[];

export function buildQueryGraph(
  structure: Restructure,
  path: string[],
  substructures: boolean = true,
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
    node = node.childMap[name];
    const newChildren: QueryField[] = [];
    children.push({ ...node.field, children: newChildren });
    children = newChildren;
    if (!node) {
      throw new Error(`invalid path item ${name} in ${path.join('.')}`);
    }
  }

  function recurse(node: TreeNode, children: QueryField[] = []): QueryField[] {
    for (const child of node.children) {
      if (child.field.typeRef.kind !== 'OBJECT') {
        children.push(child.field);
      } else if (child.query) {
        const subChildren = recurse(child);
        if (subChildren.length > 0) {
          children.push({
            ...child.field,
            disabled: substructures,
            children: subChildren,
          });
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

  function recurse(graph: QueryField, disabled: boolean = false) {
    if (graph.disabled) {
      disabled = true;
    }
    const comment = disabled ? '# ' : '';
    query += `${comment}${graph.name}`;
    if (graph.children && graph.children.length > 0) {
      query += ` {\n`;
      for (const child of graph.children) {
        recurse(child, disabled || graph.disabled);
      }
      query += `${comment}}`;
    }
    query += '\n';
  }
  recurse(graph);

  return format(query);
}
