interface Config extends $IntentionalAny {}

type HasBody = (o: any, config: Config) => boolean

interface F {
  test: (o: any, config: Config) => boolean
  renderHeader: (o: any, config: Config) => Array<$FixMe>
  hasBody: boolean | HasBody
  body?: (o: any, config: Config) => Array<$FixMe>
}

export const makeFormatter = (f: F) => {
  const formatter = {
    header: (o: any, config: Config) => {
      if (f.test(o, config)) {
        return f.renderHeader(o, config)
      } else {
        return null
      }
    },
    hasBody: typeof f.hasBody === 'boolean' ? () => f.hasBody : f.hasBody,
    body: f.body,
  }

  // @ts-ignore
  window.devtoolsFormatters = window.devtoolsFormatters || []
  // @ts-ignore
  window.devtoolsFormatters.push(formatter)
  return formatter
}
