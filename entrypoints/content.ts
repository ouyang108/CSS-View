import { createApp } from 'vue'
import cssPage from './cssPage/index.vue'

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
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
