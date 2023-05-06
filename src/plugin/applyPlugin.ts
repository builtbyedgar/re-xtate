import { Plugin } from '../types'

export const applyPlugin: (plugins: (Plugin | undefined)[]) => Plugin =
  (plugins) => (globalState, config) =>
    plugins.forEach((plugin) => plugin?.(globalState, config))
