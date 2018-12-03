import React, { ReactNode } from 'react'
import classnames from 'classnames'

import './Screen.css'

type PropTypes = {
  className?: string
  height?: string
  children: ReactNode
}
const Screen = (props: PropTypes) => {
  const style = {
    minHeight: props.height,
  }

  const cl = classnames('screen', props.className)
  return (
    <div className={cl} style={style}>
      {props.children}
    </div>
  )
}

export default Screen
