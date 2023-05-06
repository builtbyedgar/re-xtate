import {
  Config,
  GlobalStateCollection,
  GlobalStateCollectionValue,
  Listener,
  Plugin,
  Computed,
  ComputedFunction,
} from '../types'
import { isEqual } from '../utils'

/**
 * Esta función es una implementación de una computada para el manejo de estado. Las computadas
 * son una herramienta comúnmente utilizada en aplicaciones basadas en Redux o en otras
 * bibliotecas de manejo de estado para derivar valores de estado más complejos a partir de
 * uno o más valores simples. Seguramente te sonarán con el nombre de selectores.
 * 
 * Acepta un objeto con una propiedad opcional plugin.
 * 
 * Devuelve otra función que acepta una serie de argumentos de tipo desconocido, que son los
 * elementos del estado que se utilizarán para derivar el resultado de la computada.
 */
export const createGlobalComputed = ({ plugin }: { plugin?: Plugin } = {}) =>
  (<R extends GlobalStateCollection, T>(...props: unknown[]) => {
    /**
     * Comenzamos por comprobar si el último elemento del array de argumentos es una función.
     * Si es así, se asume que esta función es la computada real, mientras que todos los elementos
     * anteriores son los valores del estado que se utilizarán para derivar el resultado.
     * Si no hay una función al final, se asume que la función se encuentra en el penúltimo elemento.
     */
    const { length } = props
    const cutoff =
      typeof props[length - 1] === 'function' ? length - 1 : length - 2

    const computedFunction = props[cutoff] as ComputedFunction<R, T>
    const config = props[cutoff + 1] as Config | undefined
    props.length = cutoff
    let cache: { args: unknown[]; rest: T } | undefined

    const computed = {
      /**
       * Devuelve el valor derivado a partir de los valores del estado.
       * Si se llama a `get` varias veces con los mismos valores, la computada cacheará el 
       * resultado evitando así tener que volver a calcularlo.
       */
      get: () => {
        const args = (props as GlobalStateCollection).map((item) =>
          item.get()
        ) as GlobalStateCollectionValue<R>

        if (cache && isEqual(args, cache.args)) {
          return cache.rest
        }

        const rest = computedFunction(...args as GlobalStateCollectionValue<R>) as T
        cache = { args, rest }

        return rest
      },
      /**
       * Acepta una función como argumento y devuelve una función para cancelar la suscripción.
       */
      subscribe: (listener: Listener) => {
        const subscribers = (props as GlobalStateCollection).map((item) =>
          item.subscribe(listener)
        )

        return () => subscribers.forEach((unsubscribe) => unsubscribe())
      },
    }

    /**
     * Si se proporciona un plugin, se le llama con la computada y la configuración.
     */
    plugin?.(computed, config)
    
    return computed
  }) as Computed

export const globalComputed = createGlobalComputed()
