export function HasUniqueItens(values: any[]) {
  return new Set(values).size === values.length;
}
