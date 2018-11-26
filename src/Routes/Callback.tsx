import React, { Component } from 'react'
import { Redirect } from 'react-router'
import * as Unstated from 'unstated'

import * as auth from '../lib/auth'
import { AuthContainer } from '../App'

type Props = { location: Location }
type State = {
  token?: string
  error?: string
}

export default class Callback extends Component<Props, State> {
  state: State = {}

  constructor(readonly props: Props) {
    super(props)
  }

  async componentDidMount() {
    try {
      let token = await auth.setToken(window.location.href)

      this.setState({ token: token.accessToken })
    } catch (err) {
      this.setState({ token: undefined, error: err })
    }
  }

  render() {
    if (this.state.error) {
      return <span>{this.state.error}</span>
    }

    if (!this.state.token) {
      return <span>Loading...</span>
    }

    return (
      <Unstated.Subscribe to={[AuthContainer]}>
        {(auth: AuthContainer) => {
          auth.update()
          return <Redirect to="/homes" />
        }}
      </Unstated.Subscribe>
    )
  }
}
