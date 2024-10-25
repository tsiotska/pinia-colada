import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { QueryCache } from '../query-store'
import type { App } from 'vue'

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

      queryCache.$onAction(({ name }) => {
        console.log('action', name, 'refreshing inspector')
        // api.sendInspectorTree(INSPECTOR_ID)
        // api.sendInspectorState(INSPECTOR_ID)
      })

      api.on.getInspectorTree((payload) => {
        if (payload.app !== app || payload.inspectorId !== INSPECTOR_ID) return

        payload.rootNodes = queryCache.getEntries().map((entry) => ({
          id: entry.key.join('/'),
          label: entry.key.join('/'),
          children: [],
        }))
      })

      api.on.getInspectorState((payload) => {
        if (payload.app !== app || payload.inspectorId !== INSPECTOR_ID) return
        console.log('getInspectorState', payload)
      })
    },
  )
}
