export function startCase(input: string): string {
  return input.replace(/(^|\s)\S/g, (match) => match.toUpperCase())
}
