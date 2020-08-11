import {
  IntrospectionField,
  IntrospectionObjectType,
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionTypeRef,
} from 'graphql';
import {
  IntrospectionEnumType,
  IntrospectionInputObjectType,
  IntrospectionInputValue,
  IntrospectionInterfaceType,
  IntrospectionNamedTypeRef,
  IntrospectionScalarType,
  IntrospectionUnionType,
} from 'graphql/utilities/getIntrospectionQuery';

import { format } from 'graphql-formatter';

function sortByName<T extends { name: string }>(
  array: readonly T[],
): readonly T[] {
  return [...array].sort((a, b) => (a.name < b.name ? -1 : 1));
}

export function formatType({
  name,
  list,
  listItemRequired,
  required,
}: SimpleTypeRef): string {
  const parts = [name];
  if (!listItemRequired) {
    parts.push('?');
  }
  if (list) {
    parts.push('[]');
  }
  if (!required) {
    parts.push('?');
  }
  return parts.join('');
}

export function formatArg({ name, typeRef }: SimpleArg): string {
  const parts = [name];
  if (!typeRef.required) {
    parts.push('?');
  }
  parts.push(': ', typeRef.name);
  if (!typeRef.listItemRequired) {
    parts.push('?');
  }
  if (typeRef.list) {
    parts.push('[]');
  }
  return parts.join('');
}

type QueryType = {
  type: string;
  fields: IntrospectionField[];
  collectionFields: IntrospectionField[];
  idFields: IntrospectionField[];
};

type TypeMap = Record<string, IntrospectionType>;

export type Restructure = {
  sortedTypes: readonly IntrospectionType[];
  typeMap: TypeMap;
  queryType: TreeNode;
  mutationType?: IntrospectionObjectType;
  subscriptionType?: IntrospectionObjectType;
};

export function restructure({
  types,
  queryType,
  mutationType,
  subscriptionType,
}: IntrospectionSchema): Restructure {
  const sortedTypes = sortByName(types);
  const typeMap: TypeMap = {};
  for (const type of sortedTypes) {
    typeMap[type.name] = type;
  }

  return {
    sortedTypes,
    typeMap,
    queryType: walkTree(queryTypeAsField(queryType, typeMap), typeMap),
    mutationType: mutationType
      ? toObject(typeMap[mutationType.name])
      : undefined,
    subscriptionType: subscriptionType
      ? toObject(typeMap[subscriptionType.name])
      : undefined,
  };
}

function queryTypeAsField(
  type: IntrospectionNamedTypeRef<IntrospectionObjectType>,
  typeMap: TypeMap,
): IntrospectionField {
  return {
    name: 'query',
    args: [],
    type: toObject(typeMap[type.name]),
    isDeprecated: false,
  };
}

export type TreeNode = { field: SimpleField } & (
  | { type: 'function' }
  | { type: 'collection'; fields: SimpleField[] }
  | {
      type: 'container';
      children: TreeNode[];
      childMap: Record<string, TreeNode>;
    }
  | { type: 'value' }
);

function walkTree(field: IntrospectionField, typeMap: TypeMap): TreeNode {
  return walkType(getSimpleField(field, typeMap), typeMap);
}
function walkType(field: SimpleField, typeMap: TypeMap): TreeNode {
  const requiresArgs = field.args.some((arg) => arg.typeRef.required);
  if (requiresArgs) {
    return { type: 'function', field };
  }
  if (field.typeRef.kind !== 'OBJECT') {
    return { type: 'value', field };
  }
  const objectType = toObject(typeMap[field.typeRef.name]);
  const fields = objectType.fields.map((field) =>
    getSimpleField(field, typeMap),
  );
  if (field.typeRef.list) {
    return { type: 'collection', field, fields };
  }
  const children = fields.map((subField) => walkType(subField, typeMap));
  if (children.every(({ type }) => type === 'value')) {
    return { type: 'value', field };
  }
  const childMap: Record<string, TreeNode> = {};
  for (const child of children) {
    childMap[child.field.name] = child;
  }
  return {
    type: 'container',
    field,
    children,
    childMap,
  };
}

export type SimpleArg = {
  name: string;
  typeRef: SimpleTypeRef;
  defaultValue?: any;
};
function getSimpleArg({ name, type, defaultValue }: IntrospectionInputValue) {
  return {
    name,
    typeRef: getSimpleTypeRef(type),
    defaultValue,
  };
}
export type SimpleField = {
  name: string;
  args: SimpleArg[];
  typeRef: SimpleTypeRef;
};

export function getSimpleField(
  { name, type, args }: IntrospectionField,
  typeMap: TypeMap,
): SimpleField {
  return {
    name,
    args: args.map(getSimpleArg),
    typeRef: getSimpleTypeRef(type),
  };
}

export function queryAll(
  typeMap: TypeMap,
  queryType: QueryType,
  field?: IntrospectionField,
) {
  if (!field) {
    return `query`;
  }
  const collectionType = typeMap[queryType.type];
  switch (collectionType.kind) {
    case 'OBJECT':
    case 'INTERFACE':
      return format(`query { 
      ${field.name} {
       ${collectionType.fields
         .filter(({ type }) => {
           const kind = typeMap[getConcreteType(type)].kind;
           return kind === 'SCALAR' || kind === 'ENUM';
         })
         .map(({ name }) => name)
         .join('\n')}
      }
       }`);
    case 'UNION':
    // ??
    case 'ENUM':
    case 'SCALAR':
    case 'INPUT_OBJECT':
      return format(`query { ${field.name} }`);
  }
}
export type SimpleTypeRef = IntrospectionNamedTypeRef & {
  required: boolean;
  list: boolean;
  listItemRequired: boolean;
};

export function getSimpleTypeRef(type: IntrospectionTypeRef): SimpleTypeRef {
  let required = false;
  if (type.kind === 'NON_NULL') {
    required = true;
    type = type.ofType;
  }
  let list = false;
  if (type.kind === 'LIST') {
    list = true;
    type = type.ofType;
  }
  let listItemRequired = true;
  if (type.kind === 'NON_NULL') {
    listItemRequired = true;
    type = type.ofType;
  }
  switch (type.kind) {
    case 'SCALAR':
    case 'OBJECT':
    case 'INTERFACE':
    case 'UNION':
    case 'ENUM':
    case 'INPUT_OBJECT':
      return {
        ...type,
        required,
        list,
        listItemRequired,
      };
    case 'LIST':
      throw new Error('unsupported nested list type');
  }
}

function getConcreteType(type: IntrospectionTypeRef): string {
  switch (type.kind) {
    case 'LIST':
    case 'NON_NULL':
      return getConcreteType(type.ofType);
    default:
      return type.name;
  }
}

function isList(field: IntrospectionTypeRef): boolean {
  switch (field.kind) {
    case 'LIST':
      return true;
    case 'NON_NULL':
      return isList(field.ofType);
    default:
      return false;
  }
}

function toObject(type: IntrospectionType): IntrospectionObjectType {
  if (type.kind !== 'OBJECT') {
    throw new Error(`${type.name} is ${type.kind} not 'OBJECT'`);
  }
  return type;
}

function toScalar(type: IntrospectionType): IntrospectionScalarType {
  if (type.kind !== 'SCALAR') {
    throw new Error(`${type.name} is ${type.kind} not 'SCALAR'`);
  }
  return type;
}

function toInterface(type: IntrospectionType): IntrospectionInterfaceType {
  if (type.kind !== 'INTERFACE') {
    throw new Error(`${type.name} is ${type.kind} not 'INTERFACE'`);
  }
  return type;
}

function toUnion(type: IntrospectionType): IntrospectionUnionType {
  if (type.kind !== 'UNION') {
    throw new Error(`${type.name} is ${type.kind} not 'UNION'`);
  }
  return type;
}

function toEnum(type: IntrospectionType): IntrospectionEnumType {
  if (type.kind !== 'ENUM') {
    throw new Error(`${type.name} is ${type.kind} not 'ENUM'`);
  }
  return type;
}

function toInputObject(type: IntrospectionType): IntrospectionInputObjectType {
  if (type.kind !== 'INPUT_OBJECT') {
    throw new Error(`${type.name} is ${type.kind} not 'INPUT_OBJECT'`);
  }
  return type;
}
