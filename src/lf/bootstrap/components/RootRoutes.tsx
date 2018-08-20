import * as React from 'react'
import {compose} from 'ramda'
import projectsRoutes from '$lf/projects/routes'
import SplashUnlessBootstrapped from './SplashUnlessBootstrapped'
import {MemoryRouter as Router, Route, Switch, Redirect} from 'react-router-dom'

let PlaygroundPage
if ($env.NODE_ENV === 'development') {
  PlaygroundPage = require('$lf/playground/components/PlaygroundPage').default
}

const routes = [
  ...projectsRoutes,
  $env.NODE_ENV === 'development' && (
    <Route
      key="playgroundRoute"
      path={`/playground`}
      component={PlaygroundPage}
    />
  ),
  <Route
    key="toIndex"
    path={`/`}
    exact
    component={() => <Redirect to="/projects" />}
  />,
  <Route key="404" component={() => <div>Route not found</div>} />,
].map((el, i) => {
  return (
    el && (
      // @ts-ignore @ignore
      <el.type {...el.props} children={el.children && el.children} key={i} />
    )
  )
})

const RootRoutes = () => {
  return (
    <SplashUnlessBootstrapped>
      <Router>
        <Switch>{[...routes]}</Switch>
      </Router>
    </SplashUnlessBootstrapped>
  )
}

export default RootRoutes
