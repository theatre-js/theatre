import type {ReactNode, VFC} from 'react'
import React, {createContext, useContext} from 'react'
import {useId} from '.'

const FormControlContext = createContext<string | undefined>(undefined)

interface FormControlProps {
  id?: string
  children: ReactNode
}

export const FormControl: VFC<FormControlProps> = ({children, ...props}) => {
  const {id} = useId(props)

  return (
    <FormControlContext.Provider value={id}>
      {children}
    </FormControlContext.Provider>
  )
}

export const useFormControlContext = () => useContext(FormControlContext)
