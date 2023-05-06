import {
  createGlobalComputed,
  createGlobalState,
  globalComputed,
  globalState,
} from './core'
import { useGlobalState } from './hook'
import { applyMiddleware, reduxDevtoolsMiddleware } from './middleware'
import { applyPlugin, reduxDevtoolsPlugin } from './plugin'
import { shallowEqual, isEqual } from './utils'

export {
  createGlobalState,
  createGlobalComputed,
  globalState,
  globalComputed,
  useGlobalState,
}

export { applyMiddleware, reduxDevtoolsMiddleware }
export { applyPlugin, reduxDevtoolsPlugin  }
export { shallowEqual, isEqual }
