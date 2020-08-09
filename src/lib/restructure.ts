import {
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionDirective,
  IntrospectionObjectType,
  IntrospectionTypeRef,
  IntrospectionField,
} from 'graphql';
import {
  IntrospectionEnumType,
  IntrospectionInputObjectType,
  IntrospectionInterfaceType,
  IntrospectionScalarType,
  IntrospectionUnionType,
} from 'graphql/utilities/getIntrospectionQuery';

function sortByName<T extends { name: string }>(
  array: readonly T[],
): readonly T[] {
  return [...array].sort((a, b) => (a.name < b.name ? -1 : 1));
}

export function formatType(
  type: IntrospectionTypeRef,
  nonNull = false,
): string {
  switch (type.kind) {
    case 'LIST':
      return `${formatType(type.ofType)}[]`;
    case 'NON_NULL':
      return formatType(type.ofType, true);
    default:
      return nonNull ? type.name : `${type.name}?`;
  }
}

type QueryType = {
  type: string;
  fields: IntrospectionField[];
  collectionFields: IntrospectionField[];
  idFields: IntrospectionField[];
};

type TypeMap = Record<string, IntrospectionType>;

export type Introspection = {
  sortedTypes: readonly IntrospectionType[];
  sortedDirectives: readonly IntrospectionDirective[];
  typeMap: TypeMap;
  queryType?: IntrospectionObjectType;
  queryTypes?: QueryType[];
  queryTypeMap?: Record<string, QueryType>;
  mutationType?: IntrospectionObjectType;
  subscriptionType?: IntrospectionObjectType;
};

export function restructure({
  types,
  queryType,
  mutationType,
  subscriptionType,
  directives,
}: IntrospectionSchema): Introspection {
  const sortedTypes = sortByName(types);
  const typeMap: TypeMap = {};
  for (const type of sortedTypes) {
    typeMap[type.name] = type;
  }
  const sortedDirectives = sortByName(directives);
  function getFields(name: string) {
    const queryType = toObject(typeMap[name]);
    const queryTypeMap: Record<string, QueryType> = {};
    const queryTypes: QueryType[] = [];
    for (const field of queryType.fields) {
      const type = getConcreteType(field.type);
      let queryType: QueryType = queryTypeMap[type];
      if (!queryType) {
        queryType = {
          type,
          fields: [],
          collectionFields: [],
          idFields: [],
        };
        queryTypeMap[type] = queryType;
        queryTypes.push(queryType);
      }
      queryType.fields.push(field);
      if (!isList(field.type)) {
        queryType.idFields.push(field);
      } else if (field.args.every((arg) => arg.type.kind !== 'NON_NULL')) {
        queryType.collectionFields.push(field);
      }
    }
    queryTypes.sort((a, b) => (a.type < b.type ? -1 : 1));
    return { queryType, queryTypes, queryTypeMap };
  }

  return {
    sortedTypes,
    sortedDirectives,
    typeMap,
    ...(queryType ? getFields(queryType.name) : {}),
    mutationType: mutationType && toObject(typeMap[mutationType.name]),
    subscriptionType:
      subscriptionType && toObject(typeMap[subscriptionType.name]),
  };
}

export function queryAll(typeMap: TypeMap, queryType: QueryType) {
  const field = queryType.collectionFields[0];
  const collectionType = typeMap[queryType.type];
  switch (collectionType.kind) {
    case 'OBJECT':
    case 'INTERFACE':
      return `query { ${field.name} {
       ${collectionType.fields
         .filter(({ type }) => typeMap[getConcreteType(type)].kind === 'SCALAR')
         .map(({ name }) => name)
         .join('\n')}
      } }`;
    case 'UNION':
    // ??
    case 'ENUM':
    case 'SCALAR':
    case 'INPUT_OBJECT':
      return `query { ${field.name} }`;
  }
}

function getConcreteType(field: IntrospectionTypeRef) {
  switch (field.kind) {
    case 'LIST':
    case 'NON_NULL':
      return getConcreteType(field.ofType);
    default:
      return field.name;
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
