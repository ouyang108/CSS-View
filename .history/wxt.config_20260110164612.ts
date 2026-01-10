import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'css Inspect',
    description: 'Inspect css on any website',
    version: '1.0.0',
    permissions: ['storage'],
    // allowWindowMessaging: ['config'],
    // background: {
    //   // scripts: ['./entrypoints/background.ts'],
    // },
  },
})
