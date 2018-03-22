# Troubleshooting

### Jest is stuck in 'Determining test cases to run'

This is a known bug in jest. Temporary workaround taken from [this comment](https://github.com/facebook/jest/issues/4883#issuecomment-346444118) is:

> open `node_modules/jest-resolve/build/index.js`, and add `console.error(error)` before every line that says throw error