import { useLayoutEffect } from "react";

export function useScrollbar() {
    useLayoutEffect(() => {
      const html = document.documentElement
      
      if (html.style.overflowY !== 'scroll') {
        html.style.overflow = 'scroll'
        html.style.overflowX = 'auto'
      }
  
      return () => {
        html.style.overflow = ''
        html.style.overflowX = ''
      };
    }, [])
}