/**
 * 
 * @param {Array<unknown>} args1 
 * @param {Array<unknown>} args2 
 * @returns {boolean}
 */
export default function isEqual(args1: unknown[], args2: unknown[]): boolean {
  for (let i = 0; i < args1.length; i++) {
    if (!Object.is(args1[i], args2[i])) return false
  }

  return true
}