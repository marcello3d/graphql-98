import {
  Restructure,
  RestructureField,
  RestructureTypeRef,
  Variables,
} from './restructure';
import { format } from 'graphql-formatter';

type ArgInput = { argName: string; varName: string };
type VariableType = { varName: string; typeRef: RestructureTypeRef };
export type QueryNode = RestructureField & {
  disabled?: boolean;
  inputs?: ArgInput[];
  variableTypes?: VariableType[];
  children?: QueryNode[];
};
type QueryParentNode = QueryNode & { children: QueryNode[] };
type Fields = (string | { [key: string]: Fields })[];

export function buildQueryGraph(
  structure: Restructure,
  path: string[],
  substructures: boolean,
  args?: Variables,
): {
  rootNode: QueryParentNode;
  firstNode: QueryParentNode;
  variables?: Variables;
} {
  const rootNode: QueryParentNode = {
    ...structure.query.field,
    variableTypes: [],
    children: [],
  };
  let firstNode = rootNode;

  for (let i = 1; i < path.length; i++) {
    const name = path[i];
    const field = firstNode.typeRef.type.fieldMap[name];
    if (!field) {
      throw new Error(`invalid path item ${name} in ${path.join('.')}`);
    }
    const parent = firstNode;
    firstNode = { ...field, children: [] };
    parent.children.push(firstNode);
  }

  let variables: Variables | undefined;
  if (args) {
    variables = {};
    const counts: Record<string, number> = {};
    firstNode.inputs = [];
    rootNode.variableTypes = [];
    for (const [key, value] of Object.entries(args)) {
      const arg = firstNode.argMap[key];
      if (!arg) {
        throw new Error(`unknown arg ${key} on ${firstNode.name}`);
      }
      if (!counts[key]) {
        counts[key] = 0;
      }
      counts[key]++;
      const varName = counts[key] > 1 ? `${key}${counts[key]}` : key;
      variables[varName] = value;
      firstNode.inputs.push({ argName: arg.name, varName });
      rootNode.variableTypes.push({ varName, typeRef: arg.typeRef });
    }
  }

  function recurse(node: QueryParentNode, depth = 0): void {
    if (depth < 5) {
      for (const subField of node.typeRef.type.fields) {
        if (!subField.query) {
          continue;
        }
        if (subField.typeRef.type.fields.length === 0) {
          node.children.push(subField);
        } else {
          const subNode = {
            ...subField,
            disabled: !substructures,
            children: [],
          };
          recurse(subNode, depth + 1);
          if (subNode.children.length > 0) {
            node.children.push(subNode);
          }
        }
      }
    }
  }
  recurse(firstNode);

  return { rootNode, firstNode, variables };
}

function formatTypeRef({
  array,
  required,
  type: { name },
}: RestructureTypeRef): string {
  let type = name;
  for (const arrayRequired of array) {
    type = `[${type}${arrayRequired ? '!' : ''}]`;
  }
  if (required) {
    type += '!';
  }
  return type;
}

export function renderQuery(graph: QueryNode): string {
  let rawQuery = '';

  function recurse(node: QueryNode, disabled: boolean = false) {
    if (node.disabled) {
      disabled = true;
    }
    const comment = disabled ? '# ' : '';
    rawQuery += `${comment}${node.name}`;
    if (node.variableTypes && node.variableTypes.length > 0) {
      rawQuery += `(${node.variableTypes
        .map(({ varName, typeRef }) => `$${varName}: ${formatTypeRef(typeRef)}`)
        .join(', ')})`;
    } else if (node.inputs && node.inputs.length > 0) {
      rawQuery += `(${node.inputs
        .map(({ argName, varName }) => `${argName}: $${varName}`)
        .join(', ')})`;
    }
    if (node.children && node.children.length > 0) {
      rawQuery += ` {\n`;
      for (const child of node.children) {
        recurse(child, disabled || node.disabled);
      }
      rawQuery += `${comment}}`;
    }
    rawQuery += '\n';
  }
  recurse(graph);

  return format(rawQuery);
}
