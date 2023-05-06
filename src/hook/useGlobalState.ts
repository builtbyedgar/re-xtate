import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { GlobalState } from '../types'

/**
 * @note
 *
 * The magic is here!! 🪄
 * This is only a wrapper for React `useSyncExternalStore` hook.
 *
 * See:
 * https://github.com/reactwg/react-18/discussions/86
 * https://github.com/reactjs/rfcs/blob/main/text/0147-use-mutable-source.md
 */
export const useGlobalState = <T>({ subscribe, get }: GlobalState<T>) => useSyncExternalStore<T>(subscribe, get, get)
