if (!window.Theatre) {
  throw new Error(
    'You need to add ' +
      '<script type="text/javascript" ' +
      'src="https://dev.theatre.local:9094/index.js"></script> ' +
      'to <head> first',
  )
}

module.exports = window.Theatre
