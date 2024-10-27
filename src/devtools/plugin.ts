import { setupDevtoolsPlugin } from '@vue/devtools-api'
import {
  onDevToolsClientConnected,
  devtools,
  addCustomTab,
} from '@vue/devtools-kit'
import type { QueryCache } from '../query-store'
import { h, watch, type App } from 'vue'

const INSPECTOR_ID = 'pinia-colada'

export function registerDevtools(app: App, queryCache: QueryCache) {
  setupDevtoolsPlugin(
    {
      id: 'dev.esm.pinia-colada',
      label: 'Pinia Colada 🍹',
      logo: 'https://pinia-colada.esm.dev/logo.png',
      packageName: 'pinia-colada',
      homepage: 'https://pinia-colada.esm.dev',
      componentStateTypes: [],
      // NOTE: creates a weird type error
      app: app as any,
    },
    (api) => {
      api.addInspector({
        id: 'pinia-colada',
        label: 'Pinia Colada',
        icon: 'local_bar',
      })

      watch(
        () => queryCache.caches.get(['contacts', '1'])?.state.value,
        (value) => {
          console.log('watch', value)
        },
      )

      addCustomTab({
        name: 'Pinia Colada',
        title: 'Pinia Colada 🍹',
        icon: 'https://pinia-colada.esm.dev/logo.png',
        category: 'modules',
        view: {
          // type: 'iframe',
          // src: '/__devtools',
          type: 'vnode',
          vnode: h('div', 'Hello world'),
        },
      })

      onDevToolsClientConnected(() => {
        console.log('onDevToolsClientConnected', devtools)
      })

      queryCache.$onAction(({ name }) => {
        console.log('action', name, 'refreshing inspector')
        switch (name) {
          case 'ensure':
          case 'ensureDefinedQuery':
          case 'remove':
            api.sendInspectorTree(INSPECTOR_ID)
            break
          case 'cancel':
          case 'invalidate':
          case 'setEntryState':
          case 'fetch':
            api.sendInspectorTree(INSPECTOR_ID)
          case 'setQueryData':
            api.sendInspectorState(INSPECTOR_ID)
        }
      })

      api.on.getInspectorTree((payload) => {
        if (payload.app !== app || payload.inspectorId !== INSPECTOR_ID) return

        payload.rootNodes = queryCache.getEntries().map((entry) => ({
          id: entry.key.join('/'),
          label: entry.key.join('/'),
          tags: [
            { label: 'query', textColor: 0x000, backgroundColor: 0xAEEAAE },
          ],
        }))
      })

      api.on.getInspectorState((payload) => {
        if (payload.app !== app || payload.inspectorId !== INSPECTOR_ID) return
        console.log('getInspectorState', payload)
      })
    },
  )
}
