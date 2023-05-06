import {
  ActionCreator,
  Config,
  Listener,
  Middleware,
  State,
  Subscriber,
} from '../types'

/**
 *
 * La función `createGlobalState` acepta un objeto con una propiedad opcional @middleware
 * de tipo Middleware
 *
 * Devuelve otra función que acepta tres argumentos:
 * - @initialValue es el valor inicial del estado global
 * - @actionCreator es una función que crea las acciones para modificar el estado
 * - @config  objeto de configuración opcional
 *
 * La función interna crea un objeto que tiene tres métodos: @get, @set y @subscribe, que
 * permiten obtener, setear y escuchar cambios en el valor del estado global.
 */
export const createGlobalState =
  ({ middleware }: { middleware?: Middleware } = {}) =>
  <T, A>(
    initialValue: T,
    actionCreator?: ActionCreator<T, A>,
    config?: Config
  ) => {
    type F = (value: T) => T
    const listeners = new Set<Listener>()
    let value = initialValue

    /**
     * get
     *
     * @return {unknown} value el valor actual del estado global
     */
    const get = () => value

    /**
     * set
     *
     * @param {T | F} newValue nuevo valor, o función que toma el valor actual del estado
     * y devuelve un nuevo valor
     *
     * @returns {value} el valor actual del estado global
     */
    let set = (newValue: T | F) => {
      const nextValue =
        typeof newValue === 'function' ? (newValue as F)(value) : newValue

      // Si el nuevo valor es diferente del valor actual, se actualiza y se notifica a todos los suscriptores
      if (!Object.is(value, nextValue)) {
        value = nextValue
        listeners.forEach((listener) => listener())
      }
    }

    /**
     * @param {Listener} listener función de escucha
     * @returns función para cancelar la suscripción
     */
    const subscribe: Subscriber = (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }

    /**
     * Si se proporciona un middleware, este puede interceptar las llamadas a la función `set`
     * antes de que se actualice el valor del estado global.
     * El middleware recibe un objeto con las funciones `set`, `get` y `subscribe`, y puede
     * devolver una nueva implementación de la función `set` que realiza operaciones adicionales
     * antes o después de la actualización del valor.
     * La función set original se reemplaza por la versión proporcionada por el middleware,
     * pasando como argumentos el objeto con las funciones set, get y subscribe, junto con la configuración.
     */
    if (middleware) set = middleware({ set, get, subscribe }, config)

    return {
      get,
      set,
      subscribe,
      actions: actionCreator && actionCreator(set, get),
    } as State<T, A, ActionCreator<T, A>>
  }

export const globalState = createGlobalState()
