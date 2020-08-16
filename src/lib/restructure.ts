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
  queryField: RestructureField;
  typeQueries: Record<string, RestructureLookup[]>;
};

type TypeMap = Record<string, RestructureType>;
export type RestructureType = {
  name: string;
  raw: IntrospectionType;
  fields: RestructureField[];
  fieldMap: Record<string, RestructureField>;
};

type IntrospectionIOTypeRef =
  | IntrospectionInputTypeRef
  | IntrospectionOutputTypeRef;

export type RestructureTypeRef = {
  raw: IntrospectionIOTypeRef;
  type: RestructureType;
  required: boolean;
  array: boolean[];
};
export type RestructureArg = {
  name: string;
  typeRef: RestructureTypeRef;
};

export type RestructureLookup = {
  path: string[];
  queryField: RestructureField;
  matchedArgs: RestructureArg[];
};

export type RestructureField = {
  name: string;
  args: RestructureArg[];
  typeRef: RestructureTypeRef;
  requiredArgs: number;
  collection: boolean;
  show: boolean;
  showChildren: boolean;
  query: boolean;
};

export function restructure(schema: IntrospectionSchema): Restructure {
  console.log(`Processing schema…`);

  const types = schema.types
    .map(
      (raw: IntrospectionType): RestructureType => ({
        raw,
        name: raw.name,
        fields: [],
        fieldMap: {},
      }),
    )
    .sort((a: RestructureType, b: RestructureType) =>
      a.name < b.name ? -1 : 1,
    );

  const typeMap: TypeMap = {};
  for (const type of types) {
    typeMap[type.name] = type;
  }

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
      raw,
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

    const isObject = typeRef.type.raw.kind === 'OBJECT';
    const showChildren = isObject && !collection && requiredArgs === 0;
    const show = isObject && (showChildren || collection || args.length > 0);
    return {
      name: field.name,
      typeRef,
      args,
      requiredArgs,
      collection,
      show,
      showChildren,
      query,
    };
  }

  // Fill in fields (requires types/typeMap to be enumerated)
  for (const type of types) {
    if (type.raw.kind === 'OBJECT') {
      type.fields = type.raw.fields.map(mapField);
      for (const field of type.fields) {
        type.fieldMap[field.name] = field;
      }
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

  const typeQueries: Record<string, RestructureLookup[]> = {};
  // Find lookup query functions
  for (const { fields } of types) {
    for (const field of fields) {
      if (field.args.length === 0) {
        continue;
      }
      const targetType = field.typeRef.type;
      const matchedArgs = field.args.filter((arg) => {
        const typeRef = targetType.fieldMap[arg.name]?.typeRef;
        return (
          typeRef &&
          typeRef.type === arg.typeRef.type &&
          typeRef.array.length === 0 &&
          arg.typeRef.array.length === 0
        );
      });
      if (matchedArgs.length > 0) {
        console.log(
          `Field looks like accessor for ${targetType.name}:`,
          field,
          matchedArgs,
        );
        const lookups =
          typeQueries[targetType.name] ?? (typeQueries[targetType.name] = []);

        lookups.push({
          path: [],
          queryField: field,
          matchedArgs,
        });
      }
    }
  }

  const result: Restructure = {
    types: types,
    typeMap,
    typeQueries,
    queryField: {
      name: 'query',
      typeRef: {
        raw: { kind: 'OBJECT', name: 'query' },
        type: typeMap[schema.queryType.name],
        array: [],
        required: true,
      },
      args: [],
      requiredArgs: 0,
      collection: false,
      query: true,
      show: true,
      showChildren: true,
    },
  };
  console.log(`Processed schema:`, result);
  return result;
}
