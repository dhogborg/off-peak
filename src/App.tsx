import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import * as auth from './lib/auth'

import About from './Routes/About'
import Main from './Routes/Main'
import Callback from './Routes/Callback'

import './App.css'

const defaultUserCtx = {
  isLoggedIn: false,
}
const UserContext = React.createContext(defaultUserCtx)

export default class App extends Component {
  constructor(readonly props: any) {
    super(props)
  }

  public login = () => {
    auth.login()
  }

  public logout = () => {
    auth.logout()
  }

  public render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <nav>
              <ul>
                <li>
                  <Link to="/">About</Link>
                </li>
                {auth.isLoggedIn() ? (
                  <li>
                    <Link to="/consumption">Consumption</Link>
                  </li>
                ) : null}
                {auth.isLoggedIn() ? (
                  <li className="logout">
                    <a href="#" onClick={this.logout}>
                      Logout
                    </a>
                  </li>
                ) : (
                  <li className="login">
                    <a href="#" onClick={this.login}>
                      Login
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </header>

          <UserContext.Provider value={{ isLoggedIn: auth.isLoggedIn() }}>
            <Route path="/" exact component={About} />
            <Route path="/consumption" exact component={Main} />
            <Route path="/auth/callback" exact component={Callback} />
          </UserContext.Provider>
        </div>
      </Router>
    )
  }
}
