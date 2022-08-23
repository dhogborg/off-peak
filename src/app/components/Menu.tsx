import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAppDispatch } from '../../lib/hooks'
import * as auth from '../../lib/auth/reducer'

import './Menu.css'

const Menu = () => {
  const dispatch = useAppDispatch()
  const authState = useSelector(auth.selector)

  return (
    <header className="App-header">
      <nav>
        <ul>
          <li>
            <Link to="/">
              <img className="icon" src="/favicon.ico" />
            </Link>
          </li>
          <li>
            <Link to="/about">
              <span className="title">Om appen</span> 🤔
            </Link>
          </li>
          {authState.isLoggedIn ? (
            <li>
              <Link to="/homes">
                <span className="title">Grafer</span> 📈
              </Link>
            </li>
          ) : null}
          {authState.isLoggedIn ? (
            <li>
              <Link to="/list">
                <span className="title">Snapshots</span> 📸
              </Link>
            </li>
          ) : null}
          {authState.isLoggedIn ? (
            <li className="logout">
              <a
                href="#"
                onClick={() => {
                  dispatch(auth.logout())
                }}>
                <span className="title">Logga ut</span> 👋🏻
              </a>
            </li>
          ) : (
            <li className="login">
              <a
                href="#"
                onClick={() => {
                  dispatch(auth.login())
                }}>
                <span className="title">Logga in</span> ⚡️
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Menu
