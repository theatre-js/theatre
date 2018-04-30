import Theater from '$theater/bootstrap/Theater'
import createRootComponentForReact from '$theater/componentModel/react/createRootComponentForReact'

describe(`components`, () => {
  it(`should work`, () => {
    const theater = new Theater({withStudio: false})
    const TheaterRoot = createRootComponentForReact(theater)
  })
})
