import Head from 'next/head'

// import ReactDOM from 'react-dom'

import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
// import React from 'react'
// import App from './App'

studio.initialize({usePersistentStorage: false})

const project = getProject('Project')
const sheet = project.sheet('Sheet')
const obj = sheet.object('Obj', {str: 'some string', num: 0})

function App({obj}) {
  console.log(obj)
  return <div>hi</div>
}

export default function Home() {
  return <App obj={obj}>hi</App>
}
