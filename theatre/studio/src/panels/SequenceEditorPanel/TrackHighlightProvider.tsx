import React, {createContext, useState, useContext} from 'react'
import type {SetStateAction, Dispatch} from 'react'

const Context = createContext<{
  trackToHighlightId?: string
  setTrackToHighlightId: Dispatch<SetStateAction<string | undefined>>
}>({
  trackToHighlightId: '',
  setTrackToHighlightId: () => {},
})

const TrackHighlightProvider: React.FC = ({children}) => {
  const [trackToHighlightId, setTrackToHighlightId] = useState<string>()

  return (
    <Context.Provider value={{trackToHighlightId, setTrackToHighlightId}}>
      {children}
    </Context.Provider>
  )
}

export const useTrackHighlightProvider = () => useContext(Context)

export default TrackHighlightProvider
