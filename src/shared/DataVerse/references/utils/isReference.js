// @flow

export default function isReference(v: mixed) {
  return typeof v === 'object'&& v && v.isReference === true
}