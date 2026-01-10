import { createApp } from 'vue'
import cssPage from './cssPage/index.vue'

export default defineContentScript({
  matches: ['*://*.google.com/*'],
  main(ctx) {
    console.log('Hello content.')
    const ui = createIntegratedUi(ctx, {
      position: 'overlay',
      anchor: 'body',
      onMount: (container) => {
        const app = createApp(cssPage)
        app.mount(container)
        return app
      },
      onRemove: (app) => {
        if (app) {
          app.unmount()
        }
      },
    })

    ui.mount()
  },
})
