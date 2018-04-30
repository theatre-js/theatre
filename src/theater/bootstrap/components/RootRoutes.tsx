import * as React from 'react'
import LoadingUnlessHydrated from './LoadingUnlessBootstrapped'
import {MemoryRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import StudioUI from '$theater/workspace/components/StudioUI/StudioUI'

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
    <LoadingUnlessHydrated>
      <Router>
        <Switch>{[...routes]}</Switch>
      </Router>
    </LoadingUnlessHydrated>
  )
}

export default RootRoutes
