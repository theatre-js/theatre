import {button, initialize, useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'
import state from './state.json'

initialize(state)

function SomeComponent({id}: {id: string}) {
  const {foo} = useControls(
    {
      foo: 0,
      bar: 0,
      bez: button((set, get) => {
        set('foo', 2)
        set('bar', 3)
        console.log(get('foo'))
      }),
    },
    {folder: id},
  )

  return (
    <div>
      {id}: {foo}
    </div>
  )
}

function App() {
  const {bar} = useControls({
    bar: {foo: 'bar'},
    baz: button((set, get) => console.log(get('bar.foo'))),
  })

  const {another, panel, yo} = useControls(
    {
      another: '',
      panel: '',
      yo: 0,
    },
    {panel: 'My panel'},
  )

  const [{}, set, get] = useControls({}, {advanced: true})

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
      <button
        onClick={() => {
          set('first.foo', get('first.foo') + 1)
        }}
      >
        Increment stuff
      </button>
      {showComponent && <SomeComponent id="hidden" />}
    </div>
  )
}

render(<App />, document.getElementById('root'))
