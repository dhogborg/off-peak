import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import * as Unstated from 'unstated'
import * as auth from './lib/auth'

import Cover from './Routes/Cover'
import Menu from './components/Menu'
import About from './Routes/About'
import GraphLoader from './Routes/GraphLoader'
import SnapLoader from './Routes/SnapLoader'
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
            <Route path="/" exact component={Cover} />
            <Route path="/about" exact component={About} />
            <Route path="/homes" exact component={Homes} />
            <Route path="/homes/:priceAreaCode/:gridAreaCode/:id/graphs" component={GraphLoader} />
            <Route path="/snaps/:id/graphs" component={SnapLoader} />
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
