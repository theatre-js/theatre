import {button, useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'

function SomeComponent({id}: {id: string}) {
  const {foo} = useControls(id, {
    foo: 0,
    bez: button((get) => console.log(get('foo'))),
  })

  return (
    <div>
      {id}: {foo}
    </div>
  )
}

function App() {
  const {bar} = useControls({
    bar: {foo: 'bar'},
    baz: button((get) => console.log(get('bar'))),
  })
  const [showComponent, setShowComponent] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>{JSON.stringify(bar)}</div>
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
