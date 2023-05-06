/**
 * swallowEqual
 * 
 * La comparación se realiza a nivel superficial, es decir, se compara la igualdad de los
 * valores de las propiedades de los objetos, pero no se profundiza en los valores anidados.
 * 
 * @param {any} objA
 * @param {any} objB
 * @returns {boolean}
 */
export default function shallowEqual(objA: any, objB: any): boolean {
  // estrictamente iguales (mismo objeto en memoria)
  if (objA === objB) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  // Comprueba si tienen la misma cantidad de claves
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) {
    return false
  }

  // Comprueba si la propiedad correspondiente del otro objeto existe y tiene el mismo valor
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      objA[keysA[i]] !== objB[keysA[i]]
    ) {
      return false
    }
  }

  return true
}
