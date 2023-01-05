import {useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'

function SomeComponent() {
  const {foo} = useControls({foo: 0})

  return <div>{foo}</div>
}

function App() {
  const {bar} = useControls({bar: 'bar'})
  const [showComponent, setShowComponent] = useState(false)

  console.log(bar)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>{bar}</div>
      <button
        onClick={() => {
          setShowComponent(!showComponent)
        }}
      >
        Show another component
      </button>
      {showComponent && <SomeComponent />}
    </div>
  )
}

render(<App />, document.getElementById('root'))
