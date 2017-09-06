// @flow

export default function isReference(v: mixed) {
  return v && typeof v === 'object'&& v.isReference === true
}