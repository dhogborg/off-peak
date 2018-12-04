import React from 'react'
import { Link } from 'react-router-dom'
import * as Unstated from 'unstated'

import { AuthContainer } from '../App'
import './Menu.css'

const Menu = () => {
  return (
    <Unstated.Subscribe to={[AuthContainer]}>
      {(auth: AuthContainer) => (
        <header className="App-header">
          <nav>
            <ul>
              <li>
                <Link to="/about">
                  <img className="icon" src="/favicon.ico" />
                </Link>
              </li>
              <li>
                <Link to="/about">About 🤔</Link>
              </li>
              {auth.state.isLoggedIn ? (
                <li>
                  <Link to="/homes">Graphs 📈</Link>
                </li>
              ) : null}
              {auth.state.isLoggedIn ? (
                <li className="logout">
                  <a href="#" onClick={auth.logout}>
                    Logout 👋🏻
                  </a>
                </li>
              ) : (
                <li className="login">
                  <a href="#" onClick={auth.login}>
                    Login ⚡️
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </header>
      )}
    </Unstated.Subscribe>
  )
}

export default Menu
