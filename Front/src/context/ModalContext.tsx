import React, { createContext } from 'react';
import useModalManager from '../hooks/useModalManager';

type ModalContextType = {
  modal: ReturnType<typeof useModalManager>
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children } : {children: React.ReactNode}) {

  const modal = useModalManager({initialVisibility : false, initialModalContentId : "formAgentSettings"})

  return (
    <ModalContext.Provider value={{ modal }}>
      {children}
    </ModalContext.Provider>
  )
}