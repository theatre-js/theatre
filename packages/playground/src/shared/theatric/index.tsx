import {useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'

function SomeComponent({id}: {id: string}) {
  const {foo} = useControls(id, {foo: 0})

  return (
    <div>
      {id}: {foo}
    </div>
  )
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
      <SomeComponent id="first" />
      <SomeComponent id="second" />
      <button
        onClick={() => {
          setShowComponent(!showComponent)
        }}
      >
        Show another component
      </button>
      {showComponent && <SomeComponent id="hidden" />}
    </div>
  )
}

render(<App />, document.getElementById('root'))
