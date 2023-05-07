// State
// The GlobalState interface
export interface GlobalState<T> {
  get: Getter<T>
  subscribe: Subscriber
}

export interface Config {
  key?: string
}

export type Getter<T> = () => T
export type Setter<T> = (newValue: T | ((value: T) => T), action?: string | { type: string; [key: string]: unknown }) => void

// The action creator
export type ActionCreator<T, A> = ((set: Setter<T>, get: () => T) => A) | null | undefined

// The State
export interface State<T, A = unknown, C extends ActionCreator<T, A> = undefined> extends GlobalState<T> {
  set: Setter<T>
  actions: C extends undefined ? never : A
}

export type Listener = () => void

export type Subscriber = (listener: Listener) => () => void

export interface Middleware {
  <T>(api: GlobalState<T> & { set: Setter<T> }, config?: Config): Setter<T>
}

export interface Plugin {
  <T>(globalState: GlobalState<T>, config?: Config): void
}

export type GlobalStateCollection = GlobalState<unknown>[]

export type GlobalStateCollectionValue<R extends GlobalStateCollection> = {
  [index in keyof R]: ReturnType<R[index]['get']>
}

export type ComputedFunction<R extends GlobalStateCollection, T> = (
  ...args: GlobalStateCollectionValue<R>
) => T

export interface Computed {
  <R extends GlobalStateCollection, T>(...items: [...R, ComputedFunction<R, T>]): GlobalState<T>
  <R extends GlobalStateCollection, T>(...items: [...R, ComputedFunction<R, T>, Config]): GlobalState<T>
}

export type Action<T = undefined, P = undefined> = {
  type: T | string
  payload?: P | any
}

export type ReduxDevtoolsPlugin = (options?: { name?: string }) => Plugin | undefined
export type ReduxDevtoolsMiddleware = (options?: { name?: string }) => Middleware | undefined

declare const createGlobalState: ({ middleware }?: {middleware?: Middleware | undefined}) => 
  <T, A>(initialValue: T, actionCreator?: ActionCreator<T, A>, config?: Config) => 
    State<T, A, ActionCreator<T, A>>

declare const globalState: <T, A>(initialValue: T, actionCreator?: ActionCreator<T, A>, config?: Config) => 
  State<T, A, ActionCreator<T, A>>

declare const createGlobalComputed: ({ plugin }?: { plugin?: Plugin | undefined }) => Computed

declare const globalComputed: Computed

declare const useGlobalState: <T>({ subscribe, get }: GlobalState<T>) => T


export { createGlobalState, globalState, createGlobalComputed, globalComputed, useGlobalState  }

declare const applyMiddleware: (middlewares: (Middleware | undefined)[], options?: { fromRight?: boolean }) => Middleware

declare const reduxDevtoolsMiddleware: ReduxDevtoolsMiddleware

declare const applyPlugin: (plugins: (Plugin | undefined)[]) => Plugin

declare const reduxDevtoolsPlugin: ReduxDevtoolsPlugin

export { applyMiddleware , reduxDevtoolsMiddleware, applyPlugin, reduxDevtoolsPlugin }

declare function shallowEqual(objA: any, objB: any): boolean

declare function isEqual(args1: unknown[], args2: unknown[]): boolean

export { shallowEqual, isEqual }