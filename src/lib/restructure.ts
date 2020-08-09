import {
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionDirective,
  IntrospectionObjectType,
  IntrospectionTypeRef,
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

export function restructure({
  types,
  queryType,
  mutationType,
  subscriptionType,
  directives,
}: IntrospectionSchema): {
  sortedTypes: readonly IntrospectionType[];
  sortedDirectives: readonly IntrospectionDirective[];
  typeMap: Record<string, IntrospectionType>;
  queryType?: IntrospectionObjectType;
  mutationType?: IntrospectionObjectType;
  subscriptionType?: IntrospectionObjectType;
} {
  const sortedTypes = sortByName(types);
  const typeMap: Record<string, IntrospectionType> = {};
  for (const type of sortedTypes) {
    typeMap[type.name] = type;
  }
  const sortedDirectives = sortByName(directives);
  return {
    sortedTypes,
    sortedDirectives,
    typeMap,
    queryType: queryType && toObject(typeMap[queryType.name]),
    mutationType: mutationType && toObject(typeMap[mutationType.name]),
    subscriptionType:
      subscriptionType && toObject(typeMap[subscriptionType.name]),
  };
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
