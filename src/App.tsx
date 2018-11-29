import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import * as Unstated from 'unstated'
import * as auth from './lib/auth'

import Menu from './components/Menu'
import About from './Routes/About'
import Main from './Routes/Main'
import Homes from './Routes/Homes'
import Callback from './Routes/Callback'

import './App.css'

export default class App extends Component {
  constructor(readonly props: any) {
    super(props)
  }

  public render() {
    return (
      <Unstated.Provider>
        <Router>
          <div className="App">
            <Menu />
            <Route path="/" exact component={About} />
            <Route path="/homes" exact component={Homes} />
            <Route path="/homes/:sn/:id/graphs" component={Main} />
            <Route path="/auth/callback" exact component={Callback} />
          </div>
        </Router>
      </Unstated.Provider>
    )
  }
}

export type AuthState = {
  isLoggedIn: boolean
}

export class AuthContainer extends Unstated.Container<AuthState> {
  state: AuthState = {
    isLoggedIn: auth.isLoggedIn(),
  }

  public login() {
    auth.login()
  }

  public logout() {
    auth.logout()
    window.location.href = window.location.origin
  }

  public update() {
    this.setState({ isLoggedIn: auth.isLoggedIn() })
  }
}
