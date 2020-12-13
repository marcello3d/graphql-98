import {
  IntrospectionField,
  IntrospectionInputTypeRef,
  IntrospectionInputValue,
  IntrospectionOutputTypeRef,
  IntrospectionSchema,
  IntrospectionType,
} from 'graphql';

export type Restructure = {
  types: readonly RestructureType[];
  typeMap: TypeMap;
  query: RestructureQuery;
  typeQueries: Record<string, RestructureTypeLookup>;
};

type TypeMap = Record<string, RestructureType>;
export type RestructureType = {
  name: string;
  fields: RestructureField[];
  fieldMap: Record<string, RestructureField>;
};

type IntrospectionIOTypeRef =
  | IntrospectionInputTypeRef
  | IntrospectionOutputTypeRef;

export type RestructureTypeRef = {
  type: RestructureType;
  required: boolean;
  array: boolean[];
};
export type RestructureArg = {
  name: string;
  typeRef: RestructureTypeRef;
};

export type RestructureField = {
  name: string;
  args: RestructureArg[];
  argMap: Record<string, RestructureArg>;
  typeRef: RestructureTypeRef;
  collection: boolean;
  query: boolean;
};

export type RestructureQuery = {
  field: RestructureField;
  path: readonly string[];
  lookupArg?: RestructureArg;
  lookupArgs?: RestructureArg[];
  children?: RestructureQuery[];
};
export type RestructureLookupQuery = RestructureQuery & {
  lookupArgs: RestructureArg[];
};

function argMatchesTargetType(
  targetType: RestructureType,
  argOrField: RestructureArg | RestructureField,
) {
  const typeRef = targetType.fieldMap[argOrField.name]?.typeRef;
  return (
    typeRef &&
    typeRef.type === argOrField.typeRef.type &&
    typeRef.array.length === 0 &&
    argOrField.typeRef.array.length === 0
  );
}

function getLookupArgs(field: RestructureField): RestructureArg[] {
  const targetType = field.typeRef.type;
  return field.args.filter((arg) => {
    return (
      argMatchesTargetType(targetType, arg) ||
      arg.typeRef.type.fields.some((argField) =>
        argMatchesTargetType(targetType, argField),
      )
    );
  });
}

export type RestructureTypeLookup = {
  single: RestructureLookupQuery[];
  collection: RestructureLookupQuery[];
};

function isIdArg(arg: RestructureArg) {
  return (
    arg.name === 'id' ||
    arg.name === '_id' ||
    arg.typeRef.type.name.toUpperCase() === 'ID' ||
    arg.typeRef.type.fields.some(isIdArg)
  );
}

export function restructure(schema: IntrospectionSchema): Restructure {
  console.log(`Processing schema…`);

  const typeMap: TypeMap = {};
  const rawTypeMap: Record<string, IntrospectionType> = {};
  const types = schema.types
    .map(
      (raw: IntrospectionType): RestructureType => {
        const name = raw.name;
        const type = { name, fields: [], fieldMap: {} };
        rawTypeMap[name] = raw;
        typeMap[name] = type;
        return type;
      },
    )
    .sort((a: RestructureType, b: RestructureType) =>
      a.name < b.name ? -1 : 1,
    );

  const queryField: RestructureField = {
    name: 'query',
    typeRef: {
      type: typeMap[schema.queryType.name],
      array: [],
      required: true,
    },
    args: [],
    argMap: {},
    collection: false,
    query: true,
  };

  // Convert LIST/NON_NULL structure to simpler structure that counts the array dimensionality
  function mapTypeRef(raw: IntrospectionIOTypeRef): RestructureTypeRef {
    let ref = raw;
    let required = false;
    if (ref.kind === 'NON_NULL') {
      required = true;
      ref = ref.ofType;
    }
    const array = [];
    while (ref.kind === 'LIST') {
      ref = ref.ofType;
      let listItemRequired = false;
      if (ref.kind === 'NON_NULL') {
        listItemRequired = true;
        ref = ref.ofType;
      }
      array.push(listItemRequired);
    }
    return {
      type: typeMap[ref.name],
      required,
      array,
    };
  }
  function mapArg(arg: IntrospectionInputValue): RestructureArg {
    return {
      name: arg.name,
      typeRef: mapTypeRef(arg.type),
    };
  }

  const showChildrenSet = new Set<RestructureField>([queryField]);

  function mapField(raw: IntrospectionField): RestructureField {
    const argMap: Record<string, RestructureArg> = {};
    const args = raw.args.map((arg) => {
      const restructureArg = mapArg(arg);
      argMap[arg.name] = restructureArg;
      return restructureArg;
    });
    const typeRef = mapTypeRef(raw.type);

    const requiresArg = args.some((arg) => arg.typeRef.required);
    const collection = typeRef.array.length > 0;
    const query = !collection && !requiresArg;

    const isObject = rawTypeMap[typeRef.type.name].kind === 'OBJECT';
    const field: RestructureField = {
      name: raw.name,
      typeRef,
      args,
      argMap,
      collection,
      query,
    };
    if (isObject && !collection && !requiresArg) {
      showChildrenSet.add(field);
    }
    return field;
  }

  function mapInputField(raw: IntrospectionInputValue): RestructureField {
    const typeRef = mapTypeRef(raw.type);

    const collection = typeRef.array.length > 0;
    const query = !collection;

    const isObject = rawTypeMap[typeRef.type.name].kind === 'OBJECT';
    const field = {
      name: raw.name,
      typeRef,
      args: [],
      argMap: {},
      collection,
      query,
    };
    if (isObject && !collection) {
      showChildrenSet.add(field);
    }
    return field;
  }

  // Fill in fields (requires types/typeMap to be enumerated)
  for (const type of types) {
    const rawType = rawTypeMap[type.name];
    switch (rawType.kind) {
      case 'OBJECT':
        type.fields = rawType.fields.map(mapField);
        break;
      case 'INPUT_OBJECT':
        type.fields = rawType.inputFields.map(mapInputField);
        break;
    }
    for (const field of type.fields) {
      type.fieldMap[field.name] = field;
    }
  }

  // Find cycles (requires fields to be filled in)
  for (const type of types) {
    function checkCycles(
      type: RestructureType,
      seen: Record<string, boolean>,
    ): boolean {
      if (seen[type.name]) {
        return true;
      }
      const subSet = { ...seen, [type.name]: true };
      for (const field of type.fields) {
        if (
          showChildrenSet.has(field) &&
          checkCycles(field.typeRef.type, subSet)
        ) {
          showChildrenSet.delete(field);
        }
      }
      return false;
    }
    checkCycles(type, {});
  }

  const typeQueries: Record<string, RestructureTypeLookup> = {};
  // Build query tree
  function findQueries(
    field: RestructureField,
    path: readonly string[],
  ): RestructureQuery | undefined {
    const subFields = field.typeRef.type.fields;
    if (subFields.length === 0) {
      return;
    }
    path = [...path, field.name];
    const query: RestructureQuery = { field, path };
    const lookupArgs = getLookupArgs(field);
    if (lookupArgs.length > 0) {
      query.lookupArgs = lookupArgs;
      query.lookupArg = lookupArgs.find(isIdArg);
      const lookupQuery = query as RestructureLookupQuery;
      const lookupTypeName = field.typeRef.type.name;
      let typedQueries = typeQueries[lookupTypeName];
      if (!typedQueries) {
        typedQueries = typeQueries[lookupTypeName] = {
          single: [],
          collection: [],
        };
      }
      if (lookupQuery.field.collection) {
        typedQueries.collection.push(lookupQuery);
      } else {
        typedQueries.single.push(lookupQuery);
      }
    }
    if (showChildrenSet.has(field)) {
      const children: RestructureQuery[] = [];
      for (const subField of subFields) {
        const subResult = findQueries(subField, path);
        if (subResult) {
          children.push(subResult);
        }
      }
      if (children.length > 0) {
        query.children = children;
      }
    }
    return query;
  }

  const query = findQueries(queryField, [])!;

  const result: Restructure = { types, typeMap, query, typeQueries };

  console.log(`Processed schema:`, result);
  return result;
}

export type Variables = Record<string, any>;
