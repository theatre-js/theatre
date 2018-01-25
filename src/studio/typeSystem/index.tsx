// @flow

type Type = {
  typeName: string,
  schema: null,
}

const defineType = (t: Type) => {
  if (types[t.typeName]) {
    throw new Error(`TypeName '${t.typeName}' is already defined`)
  }

  types[t.typeName] = t
  return t
}

export const types: {[typeName: string]: Type} = {}

defineType({
  typeName: 'DeclarativeComponentDescriptor',
  schema: null,
})
