import React, { ReactNode } from 'react'
import './Screen.css'

export const Screen = (props: { children: ReactNode; height?: string }) => {
  const style = {
    minHeight: props.height,
  }

  return (
    <div className="screen" style={style}>
      {props.children}
    </div>
  )
}

export default Screen
