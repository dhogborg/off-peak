import React from 'react'
import { Link } from 'react-router-dom'
import * as Unstated from 'unstated'

import { AuthContainer } from '../../App'
import './Menu.css'

const Menu = () => {
  return (
    <Unstated.Subscribe to={[AuthContainer]}>
      {(auth: AuthContainer) => (
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
                  <span className="title">About</span> 🤔
                </Link>
              </li>
              {auth.state.isLoggedIn ? (
                <li>
                  <Link to="/homes">
                    <span className="title">Graphs</span> 📈
                  </Link>
                </li>
              ) : null}
              {auth.state.isLoggedIn ? (
                <li>
                  <Link to="/list">
                    <span className="title">Snapshots</span> 📸
                  </Link>
                </li>
              ) : null}
              {auth.state.isLoggedIn ? (
                <li className="logout">
                  <a href="#" onClick={auth.logout}>
                    <span className="title">Logout</span> 👋🏻
                  </a>
                </li>
              ) : (
                <li className="login">
                  <a href="#" onClick={auth.login}>
                    <span className="title">Login</span> ⚡️
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
