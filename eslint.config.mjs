// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    // 允许使用console.log
    rules: {
      'no-console': 'off',
      // 允许使用 debugger
      'no-debugger': 'off',
      // 未使用的变量
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // 忽略以下划线开头的未使用变量
        },
      ],
    },
  },
)
