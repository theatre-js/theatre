import type {PropTypeConfig} from '@theatre/core/propTypes'

export function isPropConfigComposite(c: PropTypeConfig): boolean {
  return c.type === 'compound' || c.type === 'enum'
}
