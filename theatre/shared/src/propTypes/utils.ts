import type {PropTypeConfig} from '@theatre/shared/src/propTypes'

export function isPropConfigComposite(c: PropTypeConfig): boolean {
  return c.type === 'compound' || c.type === 'enum'
}
