import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Screen from '../app/components/Screen'
import { useAppDispatch } from '../lib/hooks'
import * as auth from '../lib/auth/reducer'

import './Cover.css'

const Cover = () => {
  const dispatch = useAppDispatch()
  const authState = useSelector(auth.selector)

  return (
    <Screen className="cover">
      <div className="logo">
        <div>Off</div>
        <div>peak</div>
      </div>
      <div className="onwards">
        {authState.isLoggedIn ? (
          <Link to={'/homes'}>Visa din data 👉🏻</Link>
        ) : (
          <a
            href="#"
            onClick={() => {
              dispatch(auth.login())
            }}>
            Logga in med Tibber ⚡️
          </a>
        )}
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
