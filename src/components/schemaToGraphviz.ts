import {
  formatArg,
  formatType,
  getSimpleField,
  getSimpleTypeRef,
  Restructure,
  SimpleTypeRef,
} from '../lib/restructure';
import { IntrospectionObjectType } from 'graphql';

function isNodeType({ name, kind }: SimpleTypeRef) {
  return kind === 'OBJECT' && !/^_/.test(name);
}

export function computeGraph(structure: Restructure) {
  return `
digraph G {
  graph [rankdir = LR];
  node[shape=record];
${(structure.sortedTypes.filter((type) =>
  isNodeType(getSimpleTypeRef(type)),
) as IntrospectionObjectType[])
  .map(
    (object: IntrospectionObjectType) => `

  ${object.name} [
    shape = none;
    fontname = "helvetica";
    fontsize = 8;
    label = <<table border="0" cellspacing="0" width="100%">
               <tr><td port="root" border="1" bgcolor="black"><font color="white">${
                 object.name
               }</font></td></tr>
${object.fields
  .map((field) => {
    const { name, typeRef, args } = getSimpleField(field);
    const isFunc = args.length > 0;
    const typeText = formatType(typeRef, isFunc);
    const nameText = `${name}${
      isFunc
        ? `(${args.map(formatArg).join(', ')})`
        : typeRef.required
        ? ''
        : '?'
    }`;
    // Add some extra non-breaking spaces because graphviz doesn't measure the width of <b> properly
    return `
               <tr><td port="_${name}" border="1" align="left">${nameText}: <b>${typeText}</b>      </td></tr>`;
  })
  .join('')}                    
             </table>>;
  ];
${object.fields
  .filter((field) => isNodeType(getSimpleTypeRef(field.type)))
  .map(
    (field) =>
      `
  ${object.name}:_${field.name} -> ${getSimpleTypeRef(field.type).name}:root`,
  )
  .join('')}

`,
  )
  .join('')}
}`;
}
