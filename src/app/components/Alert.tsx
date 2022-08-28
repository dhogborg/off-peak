import React from 'react'
import classnames from 'classnames'

import './Alert.css'

const Alert = (props: { type?: string; children: React.ReactNode }) => {
  const type = props.type ? props.type : 'default'
  const classes = classnames('alert', type)
  return <div className={classes}>{props.children}</div>
}

export default Alert
