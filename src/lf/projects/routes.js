// @flow
/* eslint-disable react/jsx-key */
import React from 'react'
import {Route} from 'react-router-dom'
import ProjectsPage from '$lf/projects/components/ProjectsPage'

export default [
  <Route path="/projects" exact component={ProjectsPage} />,
]