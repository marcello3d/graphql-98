import {
  IntrospectionField,
  IntrospectionInputTypeRef,
  IntrospectionOutputTypeRef,
  IntrospectionSchema,
  IntrospectionType,
} from 'graphql';
import { IntrospectionInputValue } from 'graphql/utilities/getIntrospectionQuery';

export type Restructure = {
  types: readonly RestructureType[];
  typeMap: TypeMap;
  query: RestructureQuery;
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
  typeRef: RestructureTypeRef;
  requiredArgs: number;
  collection: boolean;
  showChildren: boolean;
  query: boolean;
};

export type RestructureQuery = {
  field: RestructureField;
  path: readonly string[];
  lookupArgs?: RestructureArg[];
  children?: RestructureQuery[];
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

function getLookupArgs(field: RestructureField): RestructureArg[] | undefined {
  if (field.args.length === 0) {
    return undefined;
  }
  const targetType = field.typeRef.type;
  const matchedArgs = field.args.filter((arg) => {
    const argFields = arg.typeRef.type.fields;
    if (argFields.length > 0) {
      return argFields.some((argField) =>
        argMatchesTargetType(targetType, argField),
      );
    }
    return argMatchesTargetType(targetType, arg);
  });
  if (matchedArgs.length > 0) {
    console.log(
      `Field ${field.name} looks like accessor for ${targetType.name}:`,
      field,
      matchedArgs,
    );
    return matchedArgs;
  }
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

  // Convert LIST/NON_NULL structure to simpler structure that counts the array dimensionality
  function mapTypeRef(raw: IntrospectionIOTypeRef): RestructureTypeRef {
    let ref = raw;
    let required = false;
    if (ref.kind === 'NON_NULL') {
      required = true;
      ref = ref.ofType;
    }
    let array = [];
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

  function mapField(field: IntrospectionField): RestructureField {
    const args = field.args.map(mapArg);
    const typeRef = mapTypeRef(field.type);

    const requiredArgs = args.filter((arg) => arg.typeRef.required).length;
    const collection = typeRef.array.length > 0;
    const query = !collection && requiredArgs === 0;

    const isObject = rawTypeMap[typeRef.type.name].kind === 'OBJECT';
    const showChildren = isObject && !collection && requiredArgs === 0;
    return {
      name: field.name,
      typeRef,
      args,
      requiredArgs,
      collection,
      showChildren,
      query,
    };
  }

  function mapInputField(field: IntrospectionInputValue): RestructureField {
    const typeRef = mapTypeRef(field.type);

    const collection = typeRef.array.length > 0;
    const query = !collection;

    const isObject = rawTypeMap[typeRef.type.name].kind === 'OBJECT';
    const showChildren = isObject && !collection;
    return {
      name: field.name,
      typeRef,
      args: [],
      requiredArgs: 0,
      collection,
      showChildren,
      query,
    };
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
        if (field.showChildren && checkCycles(field.typeRef.type, subSet)) {
          field.showChildren = false;
        }
      }
      return false;
    }
    checkCycles(type, {});
  }

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
    const result: RestructureQuery = { field, path };
    const lookupArgs = getLookupArgs(field);
    if (lookupArgs) {
      result.lookupArgs = lookupArgs;
    }
    if (field.showChildren) {
      const children: RestructureQuery[] = [];
      for (const subField of subFields) {
        const subResult = findQueries(subField, path);
        if (subResult) {
          children.push(subResult);
        }
      }
      if (children.length > 0) {
        result.children = children;
      }
    }
    return result;
  }

  const query = findQueries(
    {
      name: 'query',
      typeRef: {
        type: typeMap[schema.queryType.name],
        array: [],
        required: true,
      },
      args: [],
      requiredArgs: 0,
      collection: false,
      query: true,
      showChildren: true,
    },
    [],
  )!;

  const result: Restructure = {
    types: types,
    typeMap,
    query,
  };
  console.log(`Processed schema:`, result);
  return result;
}
