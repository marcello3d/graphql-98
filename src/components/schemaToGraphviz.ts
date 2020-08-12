import {
  formatType,
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
  .map(({ name, type }) => {
    const typeRef = getSimpleTypeRef(type);
    const typeText = formatType(typeRef, false);
    const nameText = `${name}${typeRef.required ? '' : '?'}`;
    return `
               <tr><td port="_${name}" border="1" align="left">${nameText}   :   ${typeText}</td></tr>`;
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
