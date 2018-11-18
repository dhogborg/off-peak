import React, { ReactNode } from 'react'
import './Screen.css'

export const Screen = (props: { children: ReactNode }) => {
  return <div className="screen">{props.children}</div>
}
