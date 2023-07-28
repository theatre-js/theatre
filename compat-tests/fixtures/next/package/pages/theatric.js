import {button, initialize, useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'

// initialize()

function SomeComponent({id}) {
  const {foo, $get, $set} = useControls(
    {
      foo: 0,
      bar: 0,
      bez: button(() => {
        $set((p) => p.foo, 2)
        $set((p) => p.bar, 3)
        console.log($get((p) => p.foo))
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

export default function App() {
  const {bar, $set, $get} = useControls({
    bar: {foo: 'bar'},
    baz: button(() => console.log($get((p) => p.bar))),
  })

  const {another, panel, yo} = useControls(
    {
      another: '',
      panel: '',
      yo: 0,
    },
    {panel: 'My panel'},
  )

  const {} = useControls({})

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
          $set((p) => p.bar.foo, $get((p) => p.bar.foo) + 1)
        }}
      >
        Increment stuff
      </button>
      {showComponent && <SomeComponent id="hidden" />}
      {yo}
    </div>
  )
}
