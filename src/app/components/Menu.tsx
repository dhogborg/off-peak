import { useSelector, useDispatch } from 'src/lib/hooks'
import { Link } from 'react-router-dom'

import * as auth from '../../lib/auth/reducer'

import './Menu.css'

const Menu = () => {
  const dispatch = useDispatch()
  const authState = useSelector(auth.selector)

  return (
    <header className="App-header">
      <nav>
        <ul>
          <li>
            <Link to="/">
              <img className="icon" alt="start" src="/favicon.ico" />
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
              <button
                className="btn-link"
                onClick={() => {
                  dispatch(auth.logout())
                }}>
                <span className="title">Logga ut</span> 👋🏻
              </button>
            </li>
          ) : (
            <li className="login">
              <button
                className="btn-link"
                onClick={() => {
                  dispatch(auth.login())
                }}>
                <span className="title">Logga in</span> ⚡️
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Menu
