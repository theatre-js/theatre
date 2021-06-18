const path = require('path')

module.exports = {
  rules: {
    'no-relative-imports': [
      'warn',
      {
        aliases: [
          {name: '@theatre/core', path: path.resolve(__dirname, './core/src')},
          {
            name: '@theatre/shared',
            path: path.resolve(__dirname, './shared/src'),
          },
          {
            name: '@theatre/studio',
            path: path.resolve(__dirname, './studio/src'),
          },
        ],
      },
    ],
  },
}
