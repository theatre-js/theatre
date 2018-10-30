if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  const installReactDevtoolsGlobalHook = require('$root/vendor/react-devtools-backend/installGlobalHook')
  installReactDevtoolsGlobalHook(window)
}

const setupBackend = require('$root/vendor/react-devtools-backend/backend')
setupBackend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
