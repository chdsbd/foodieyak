export function assertNever(val: never): never {
  throw new Error(`expected never, got ${val}`)
}
