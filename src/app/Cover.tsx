import React from 'react'
import { useSelector } from 'src/lib/hooks'
import { Link } from 'react-router-dom'

import Screen from '../app/components/Screen'
import { useDispatch } from '../lib/hooks'
import * as auth from '../lib/auth/reducer'

import './Cover.css'

const Cover = () => {
  const dispatch = useDispatch()
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
          <button
            className="btn-link"
            onClick={() => {
              dispatch(auth.login())
            }}>
            <span>Logga in med Tibber ⚡️</span>
          </button>
        )}
      </div>
      <div>
        <Link to={'/snaps/bnfIurZT63EmLydrD9RF/graphs'}>Visa demo 📈</Link>
      </div>
      <div>
        <Link to={'/about'}>Om denna appen 🤔</Link>
      </div>
    </Screen>
  )
}

export default Cover
