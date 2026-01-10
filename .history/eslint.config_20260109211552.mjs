// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    // 允许使用console.log
    'no-console': 'off',
  },
)
