import alias from '@rollup/plugin-alias'
import path from 'path'
import { fileURLToPath } from 'url';
import flatDts from 'rollup-plugin-flat-dts'
import ts from 'rollup-plugin-typescript2'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fromPrivatePackage = (s) => path.join(__dirname, '../..', s)

const config = ['studio', 'core'].map((which) => {
  const fromPackage = (s) => path.join(fromPrivatePackage(`${which}`), s)

  return {
    input: {
      [which]: fromPrivatePackage(`.temp/declarations/${which}/src/index.d.ts`),
    },
    output: {
      dir: fromPackage('dist'),
      entryFileNames: 'index.d.ts',
      format: 'es',
      plugins: [ts({ tsconfig: '../../tsconfig.json' }), flatDts({ tsconfig: '../../tsconfig.json' })],
    },
    external: (s) => {
      if (
        s === '@theatre/dataverse' ||
        s.startsWith(`@theatre/${which === 'studio' ? 'core' : 'studio'}`)
      ) {
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
      ts(),
      alias({
        entries: [
          {
            find: `@theatre/${which}`,
            replacement: fromPrivatePackage(`.temp/declarations/${which}/src`),
          },
          {
            find: '@theatre/shared',
            replacement: fromPrivatePackage('.temp/declarations/shared/src'),
          },
        ],
      }),
    ],
  }
})

export default config
