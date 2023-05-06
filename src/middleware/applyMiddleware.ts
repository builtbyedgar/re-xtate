import { Middleware } from '../types'

export const applyMiddleware :(middlewares: (Middleware | undefined)[], options?: { fromRight?: boolean }) => Middleware =
  (middlewares, { fromRight } = {}) =>
  (api, config) =>
    middlewares[fromRight ? 'reduceRight' : 'reduce'](
      (set, middleware) => (middleware ? middleware({ ...api, set }, config) : set),
      api.set
    )
