// @flow
import noop from 'lodash/noop'

const installDevtoolsExtensions = () => {
  require('electron-debug')({showDevTools: true})

  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS,
  } = require('electron-devtools-installer')

  return installExtension(REACT_DEVELOPER_TOOLS).then(installExtension(REDUX_DEVTOOLS))
}

export default process.env.NODE_ENV !== 'development' ? noop : installDevtoolsExtensions