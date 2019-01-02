import React, { Component } from 'react'
import { Redirect } from 'react-router'
import * as Unstated from 'unstated'

import * as auth from '../lib/auth'
import { AuthContainer } from '../App'
import Alert from '../app/components/Alert'

type Props = { location: Location }
type State = {
  hasToken?: boolean
  error?: string
}

export default class Callback extends Component<Props, State> {
  state: State = {
    hasToken: false,
  }

  constructor(readonly props: Props) {
    super(props)
  }

  async componentDidMount() {
    try {
      await auth.setToken(window.location.href)
      this.setState({ hasToken: true })
    } catch (err) {
      this.setState({ hasToken: false, error: err.message })
    }
  }

  render() {
    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error}</Alert>
    }

    if (!this.state.hasToken) {
      return <Alert>Laddar...</Alert>
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
