import * as React from 'react'
import LoadingUnlessBootstrapped from './LoadingUnlessBootstrapped'
import {MemoryRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import StudioUI from '$studio/workspace/components/StudioUI/StudioUI'

const mainRoutes = [<Route key="/" path="/" component={StudioUI} />]

const routes = [
  ...mainRoutes,
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
      <el.type {...el.props} children={el.children && el.children} key={i} />
    )
  )
})

const RootRoutes = () => {
  return (
    <LoadingUnlessBootstrapped>
      <Router>
        <Switch>{[...routes]}</Switch>
      </Router>
    </LoadingUnlessBootstrapped>
  )
}

export default RootRoutes