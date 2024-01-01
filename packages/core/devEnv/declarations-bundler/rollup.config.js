import alias from '@rollup/plugin-alias'
import path from 'path'
import {dts} from 'rollup-plugin-dts'

const fromPackages = (s) => path.join(__dirname, '../../../', s)
const fromPackage = (s) => path.join(__dirname, '../..', s)

const config = {
  input: {
    core: fromPackage(`.temp/declarations/src/index.d.ts`),
  },
  output: {
    dir: fromPackage('dist'),
    entryFileNames: 'index.d.ts',
    format: 'es',
  },
  external: (s) => {
    if (s === '@theatre/dataverse') {
      return true
    }

    if (s.startsWith('@theatre')) {
      return false
    }

    if (s.startsWith('/') || s.startsWith('./') || s.startsWith('../')) {
      return false
    }

    return true
  },

  plugins: [
    dts({respectExternal: true}),
    alias({
      entries: [
        {
          find: `@theatre/core`,
          replacement: fromPackage(`.temp/declarations/src`),
        },
        {
          find: `@theatre/utils`,
          replacement: fromPackages(`utils/src`),
        },
      ],
    }),
  ],
}

export default config
