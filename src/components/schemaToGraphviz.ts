import { Restructure, RestructureType } from '../lib/restructure';
import { formatArg, formatType } from '../lib/restructureFormatters';

function showType({ name, fields }: RestructureType) {
  return fields.length > 0 && !/^_/.test(name);
}

export function computeGraph(structure: Restructure) {
  return `
digraph G {
  graph [rankdir = LR];
  node[shape=record];
${structure.types
  .filter(showType)
  .map(
    (type) => `
  ${type.name} [
    shape = none;
    fontname = "helvetica";
    fontsize = 8;
    label = <<table border="0" cellspacing="0" width="100%">
               <tr><td port="root" border="1" bgcolor="black"><font color="white">${
                 type.name
               }</font></td></tr>${type.fields
      .map(({ args, typeRef, name }) => {
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
               <tr><td port="field_${name}" border="1" align="left">${nameText}: <b>${typeText}</b>      </td></tr>`;
      })
      .join('')}                    
             </table>>;
  ];${type.fields
    .filter((field) => showType(field.typeRef.type))
    .map(
      (field) =>
        `
  ${type.name}:field_${field.name} -> ${field.typeRef.type.name}`,
    )
    .join('')}
`,
  )
  .join('')}
}`;
}
