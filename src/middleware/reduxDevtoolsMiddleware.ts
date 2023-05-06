import type {} from '@redux-devtools/extension'
import { ReduxDevtoolsMiddleware } from '../types'

export const reduxDevtoolsMiddleware: ReduxDevtoolsMiddleware = ({
  name,
} = {}) => {
  let devtoolsExt: Window['__REDUX_DEVTOOLS_EXTENSION__']

  if (
    process.env.NODE_ENV === 'production' ||
    typeof window === 'undefined' ||
    !(devtoolsExt = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__)
  ) {
    return
  }

  const devtools = devtoolsExt.connect({ name })
  const mergedState: { [index: string]: unknown } = {}

  return ({ set, get }: { set: any; get: any }, config: any) => {
    const key = config?.key

    if (!key) {
      throw new Error(
        '[global-state] States should be provided with a string `key` in the config object when the `reduxDevtools` middleware is used.'
      )
    }

    mergedState[key] = get()

    devtools.init(mergedState)

    return (...args: any) => {
      const [value, action] = args

      set(...args)

      mergedState[key] = get()

      devtools.send(
        typeof action === 'string'
          ? { type: action }
          : action || { type: `${key}`, value },
        mergedState
      )
    }
  }
}
