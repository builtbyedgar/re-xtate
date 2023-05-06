import type {} from '@redux-devtools/extension'
import { Action } from '../types'
import { ReduxDevtoolsPlugin } from '../types'

export const reduxDevtoolsPlugin: ReduxDevtoolsPlugin = ({ name } = {}) => {
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

  return ({ get, subscribe }: { get: any; subscribe: any }, config?: any) => {
    const key = config?.key

    if (!key) {
      throw new Error(
        '[global-state] States should be provided with a string `key` in the config object when the `reduxDevtools` plugin is used.'
      )
    }
    
    const updateState = () => {
      mergedState[key] = get()
      const value = mergedState[key]
      devtools.send({ type: `${key}`, value } as Action, mergedState)

    }

    updateState()
    subscribe(updateState)
  }
}
