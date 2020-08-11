import { formatType, getSimpleType, Restructure } from '../lib/restructure';
import { IntrospectionObjectType, IntrospectionType } from 'graphql';

function isNodeType({ name, kind }: IntrospectionType) {
  return kind === 'OBJECT' && !/^_/.test(name);
}

export function computeGraph(structure: Restructure) {
  return `
digraph G {
  graph [rankdir = LR];
  node[shape=record];
${(structure.sortedTypes.filter(isNodeType) as IntrospectionObjectType[])
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
  .map(
    (field) =>
      `
               <tr><td port="_${field.name}" border="1" align="left">${
        field.name
      }   :   ${formatType(field.type)}</td></tr>`,
  )
  .join('')}                    
             </table>>;
  ];
${object.fields
  .filter((field) => isNodeType(getSimpleType(field.type).type))
  .map(
    (field) =>
      `
  ${object.name}:_${field.name} -> ${getSimpleType(field.type).type.name}:root`,
  )
  .join('')}

`,
  )
  .join('')}
}`;
}
