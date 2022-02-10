import type {FC} from 'react'
import React, {createContext, useContext, useState} from 'react'

const editingContext = createContext<{
  editing: boolean
  setEditing: (editing: boolean) => void
}>(undefined!)

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
