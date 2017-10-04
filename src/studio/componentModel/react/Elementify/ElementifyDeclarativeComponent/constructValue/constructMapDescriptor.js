// @flow


const constructMapDescriptor = (des: $FixMe, d: $FixMe) => {
  return des.prop('values').flatMap((m) => {
    m.map()
  })
}

export default constructMapDescriptor