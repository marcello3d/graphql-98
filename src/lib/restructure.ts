import {
  IntrospectionField,
  IntrospectionObjectType,
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionTypeRef,
} from 'graphql';
import {
  IntrospectionInputValue,
  IntrospectionNamedTypeRef,
} from 'graphql/utilities/getIntrospectionQuery';

function sortByName<T extends { name: string }>(
  array: readonly T[],
): readonly T[] {
  return [...array].sort((a, b) => (a.name < b.name ? -1 : 1));
}

export function formatType(
  { name, array, required }: SimpleTypeRef,
  includeRequired: boolean = true,
): string {
  const parts = [name];
  for (const listItemRequired of array) {
    if (!listItemRequired) {
      parts.push('?');
    }
    parts.push('[]');
  }
  if (includeRequired && !required) {
    parts.push('?');
  }
  return parts.join('');
}

export function formatArg({ name, typeRef }: SimpleArg): string {
  const parts = [name];
  if (!typeRef.required) {
    parts.push('?');
  }
  parts.push(': ', formatType(typeRef, false));
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

export type TreeNode = {
  field: SimpleField;
  requiredArgs: SimpleArg[];
  optionalArgs: SimpleArg[];
  collection: boolean;
  show: boolean;
  showChildren: boolean;
  query: boolean;
  children: TreeNode[];
  childMap: Record<string, TreeNode>;
};

function walkTree(field: IntrospectionField, typeMap: TypeMap): TreeNode {
  return walkType(getSimpleField(field), typeMap);
}
function walkType(
  field: SimpleField,
  typeMap: TypeMap,
  seenTypes: ReadonlySet<string> = new Set(),
): TreeNode {
  const requiredArgs = field.args.filter((arg) => arg.typeRef.required);
  const optionalArgs = field.args.filter((arg) => !arg.typeRef.required);
  const collection = field.typeRef.array.length > 0;
  const query = !collection && requiredArgs.length === 0;

  if (seenTypes.has(field.typeRef.name) || field.typeRef.kind !== 'OBJECT') {
    return {
      field,
      requiredArgs,
      optionalArgs,
      collection,
      show: false,
      showChildren: false,
      query,
      children: [],
      childMap: {},
    };
  }
  const objectType = toObject(typeMap[field.typeRef.name]);
  const fields = objectType.fields.map((field) => getSimpleField(field));
  const subSeenTypes = new Set([...seenTypes, field.typeRef.name]);
  const children = fields.map((subField) =>
    walkType(subField, typeMap, subSeenTypes),
  );
  const childMap: Record<string, TreeNode> = {};
  for (const child of children) {
    childMap[child.field.name] = child;
  }
  const showChildren = query && children.some(({ show }) => show);
  return {
    field,
    requiredArgs,
    optionalArgs,
    collection,
    show: collection || field.args.length > 0 || showChildren,
    showChildren,
    query,
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

export function getSimpleField({
  name,
  type,
  args,
}: IntrospectionField): SimpleField {
  return {
    name,
    args: args.map(getSimpleArg),
    typeRef: getSimpleTypeRef(type),
  };
}

export type SimpleTypeRef = IntrospectionNamedTypeRef & {
  required: boolean;
  array: boolean[];
};

export function getSimpleTypeRef(type: IntrospectionTypeRef): SimpleTypeRef {
  let required = false;
  if (type.kind === 'NON_NULL') {
    required = true;
    type = type.ofType;
  }
  let array = [];
  while (type.kind === 'LIST') {
    type = type.ofType;
    let listItemRequired = false;
    if (type.kind === 'NON_NULL') {
      listItemRequired = true;
      type = type.ofType;
    }
    array.push(listItemRequired);
  }
  return {
    ...type,
    required,
    array,
  };
}

function toObject(type: IntrospectionType): IntrospectionObjectType {
  if (type.kind !== 'OBJECT') {
    throw new Error(`${type.name} is ${type.kind} not 'OBJECT'`);
  }
  return type;
}
