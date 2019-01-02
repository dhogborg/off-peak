import React from 'react'
import * as Unstated from 'unstated'

import Screen from '../app/components/Screen'
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
              return <Link to={'/homes'}>Visa din data 👉🏻</Link>
            } else {
              return (
                <a href="#" onClick={auth.login}>
                  Logga in med Tibber ⚡️
                </a>
              )
            }
          }}
        </Unstated.Subscribe>
      </div>
      <div>
        <a href="/snaps/bnfIurZT63EmLydrD9RF/graphs">Visa demo 📈</a>
      </div>
      <div>
        <Link to={'/about'}>Om denna appen 🤔</Link>
      </div>
    </Screen>
  )
}

export default Cover
