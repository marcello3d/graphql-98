import { Restructure, RestructureField } from '../lib/restructure';
import { format } from 'graphql-formatter';

export type QueryField = RestructureField & {
  disabled?: boolean;
  children?: QueryField[];
};

type Fields = (string | { [key: string]: Fields })[];

export function buildQueryGraph(
  structure: Restructure,
  path: string[],
  substructures: boolean = true,
): {
  field: RestructureField;
  queryGraph: QueryField;
  fields: QueryField[];
} {
  let field: RestructureField = structure.queryField;
  let children: QueryField[] = [];

  const queryGraph: QueryField = {
    ...field,
    children,
  };

  for (let i = 1; i < path.length; i++) {
    const name = path[i];
    field = field.typeRef.type.fieldMap[name];
    const newChildren: QueryField[] = [];
    children.push({ ...field, children: newChildren });
    children = newChildren;
    if (!field) {
      throw new Error(`invalid path item ${name} in ${path.join('.')}`);
    }
  }

  function recurse(
    node: RestructureField,
    children: QueryField[] = [],
  ): QueryField[] {
    for (const subField of node.typeRef.type.fields) {
      if (!subField.query) {
        continue;
      }
      if (subField.typeRef.type.fields.length === 0) {
        children.push(subField);
      } else {
        const subChildren = recurse(subField);
        if (subChildren.length > 0) {
          children.push({
            ...subField,
            disabled: substructures,
            children: subChildren,
          });
        }
      }
    }
    return children;
  }
  recurse(field, children);

  return { field, queryGraph, fields: children };
}

export function renderQuery(graph: QueryField) {
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
