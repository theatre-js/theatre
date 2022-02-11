import type {FC} from 'react'
import React, {createContext, useContext, useState} from 'react'

const editingContext = createContext<{
  editing: boolean
  setEditing: (editing: boolean) => void
}>(undefined!)

/**
 * Provides the current mode the color picker is in. When editing, the picker should be
 * stateful and disregard controlling props, while not editing, it should behave
 * in a controlled manner.
 */
export const EditingProvider: FC = ({children}) => {
  const [editing, setEditing] = useState(false)

  return (
    <editingContext.Provider
      value={{
        editing,
        setEditing,
      }}
    >
      {children}
    </editingContext.Provider>
  )
}

export const useEditing = () => useContext(editingContext)
