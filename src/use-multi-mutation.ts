import type { UseMutationOptions } from './use-mutation'
import type { ErrorDefault } from './types-extension'
import type { _EmptyObject } from './utils'
import { noop } from './utils'
import { useMutationCache, type UseMultiMutationEntry } from './mutation-store'
import { computed, shallowRef } from 'vue'

/**
 * @example
 * ```ts
 * const { data, isLoading, error, mutate, reset, clearKey } = useMultiMutation({
 *   mutation: async (id: number) => {
 *     return await api.deleteItem(id)
 *   },
 *   onSuccess: () => {
 *     console.log('Mutation succeeded')
 *   },
 *   onError: () => {
 *     console.log('Mutation failed')
 *   },
 * })
 *
 * mutate('item-1', 123)
 *
 * if (isLoading('item-1')) {
 *   console.log('Loading...')
 * }
 *
 * console.log(data('item-1'))
 * console.log(error('item-1'))
 *
 * forget('item-2')
 * reset()
 *
 */

export function useMultiMutation<TResult, TVars = void, TError = ErrorDefault, TContext extends Record<any, any> = _EmptyObject>(
  options: UseMutationOptions<TResult, TVars, TError, TContext>,
) {
  const mutationCache = useMutationCache()
  const entry = shallowRef<UseMultiMutationEntry<TResult, TVars, TError, TContext>>(
    mutationCache.ensureMultiMutation(options),
  )
  console.log(entry.value)

  function data(invocationKey: string) {
    return entry.value.invocations.get(invocationKey)?.state.value.data
  }

  function isLoading(invocationKey: string) {
    return entry.value.invocations.get(invocationKey)?.asyncStatus.value === 'loading'
  }

  function error(invocationKey: string) {
    return entry.value.invocations.get(invocationKey)?.state.value.error
  }

  async function mutateAsync(invocationKey: string, vars: TVars): Promise<TResult> {
    if (!vars) {
      throw new Error('Mutation variables are required for multi-mutation.')
    }
    const invocationEntry = mutationCache.addInvocation(entry.value, invocationKey, options, vars)
    return mutationCache.mutate(invocationEntry, vars)
  }

  function mutate(invocationKey: string, vars: TVars) {
    mutateAsync(invocationKey, vars).catch(noop)
  }

  function forget(invocationKey: string) {
    mutationCache.removeInvocation(entry.value, invocationKey)
  }

  // TODO: do all resets in mutation-store.
  function reset() {
    entry.value.invocations.clear()
  }

  // const variables = computed(() => entry.value.recentMutation.vars)

  return {
    data,
    isLoading,
    error,
    mutate,
    mutateAsync,
    reset,
    forget,
  }
}
