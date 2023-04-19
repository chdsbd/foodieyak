// calling this assertCond so typescript doesn't think this is a chai / vitest thing
export function assertCond(
  condition: unknown,
  msg?: string,
): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}
