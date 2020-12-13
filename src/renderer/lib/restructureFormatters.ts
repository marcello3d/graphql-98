import { RestructureArg, RestructureTypeRef } from './restructure';

export function formatType(
  { type, array, required }: RestructureTypeRef,
  includeRequired: boolean = true,
): string {
  const parts = [type.name];
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

export function formatArg({ name, typeRef }: RestructureArg): string {
  const parts = [name];
  if (!typeRef.required) {
    parts.push('?');
  }
  parts.push(': ', formatType(typeRef, false));
  return parts.join('');
}
