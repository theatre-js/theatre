// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
// import projectsRoutes from '$studio/projects/routes'
import LoadingUnlessBootstrapped from './LoadingUnlessBootstrapped'
import {MemoryRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import TheInterface from '$studio/TheInterface/components'

const mainRoutes = [
  <Route key="/" path="/" component={TheInterface} />
]
    
const routes =
  [
    ...mainRoutes,
    <Route key="toIndex" path={`/`} exact component={() => <Redirect to="/projects" />} />,
    <Route key="404" component={() => <div>Route not found</div>} />,
  ].map((el, i) => {
    return el && <el.type {...el.props} children={el.children && el.children} key={i} /> // eslint-disable-line
  })

const RootRoutes = () => {
  return (
    <LoadingUnlessBootstrapped>
      <Router><Switch>{[...routes]}</Switch></Router>
    </LoadingUnlessBootstrapped>
  )
}

export default compose(
  (a) => a
)(RootRoutes)
