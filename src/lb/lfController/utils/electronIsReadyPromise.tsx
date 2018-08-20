import {app} from 'electron'
import {defer} from '$shared/utils/defer'

const installDevtoolsExtensions = () => {
  require('electron-debug')({showDevTools: true})

  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
  } = require('electron-devtools-installer')

  return installExtension(REACT_DEVELOPER_TOOLS).then(
    installExtension(REDUX_DEVTOOLS),
  )
}

function waitForElectron(): $FixMe {
  if (!app) return Promise.resolve()
  const d = defer()
  app.on('ready', d.resolve)
  return d.promise
}

export default waitForElectron().then((): $FixMe => {
  if ($env.NODE_ENV === 'development') return installDevtoolsExtensions()
})
