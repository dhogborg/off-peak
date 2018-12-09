import React from 'react'
import * as Unstated from 'unstated'

import Screen from '../components/Screen'
import { AuthContainer } from '../App'
import { Link } from 'react-router-dom'

import './Cover.css'

const Cover = () => {
  return (
    <Screen className="cover">
      <div className="logo">
        <div>Off</div>
        <div>peak</div>
      </div>
      <div className="onwards">
        <Unstated.Subscribe to={[AuthContainer]}>
          {(auth: AuthContainer) => {
            if (auth.state.isLoggedIn) {
              return <Link to={'/homes'}>Click to proceed 👉🏻</Link>
            } else {
              return (
                <a href="#" onClick={auth.login}>
                  Click here to log in ⚡️
                </a>
              )
            }
          }}
        </Unstated.Subscribe>
      </div>
      <div>
        <Link to={'/about'}>About this app 🤔</Link>
      </div>
    </Screen>
  )
}

export default Cover
