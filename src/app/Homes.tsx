import React, { Component, ReactNode } from 'react'
import { Redirect } from 'react-router'

import * as tibber from '../lib/tibber'
import Alert from '../app/components/Alert'

import './Homes.css'
import { errorString } from '../lib/helpers'

type Props = {}
type State = {
  homes?: tibber.Home[]
  error?: string
  redirect?: tibber.Home
}

export default class Homes extends Component<Props, State> {
  state: State = {}

  constructor(readonly props: Props) {
    super(props)
  }

  async componentDidMount() {
    try {
      const homes = await tibber.getHomes()
      const redict = homes.length == 1 ? homes[0] : undefined

      this.setState({
        ...this.state,
        homes,
        redirect: redict,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: errorString(err),
      })
    }
  }

  clickedHome(home: tibber.Home) {
    this.setState({
      ...this.state,
      redirect: home,
    })
  }

  render() {
    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error}</Alert>
    }

    if (!this.state.homes) {
      return <Alert>Laddar...</Alert>
    }

    if (this.state.homes.length == 0) {
      return <Alert>Det finns inga hem kopplade till ditt konto</Alert>
    }

    if (this.state.redirect) {
      const home = this.state.redirect
      const { priceAreaCode, gridAreaCode } = this.state.redirect.meteringPointData
      return <Redirect to={`/homes/${priceAreaCode}/${gridAreaCode}/${home.id}/graphs`} />
    }

    return (
      <div className="homes">
        {this.state.homes.map((home) => {
          return <Home key={home.id} home={home} onClick={this.clickedHome.bind(this)} />
        })}
      </div>
    )
  }
}

type HomeProps = {
  key: string
  home: tibber.Home
  onClick: (home: tibber.Home) => void
  children?: ReactNode
}

const Home = (props: HomeProps) => {
  return (
    <div
      className="home"
      onClick={() => {
        props.onClick(props.home)
      }}>
      <div className="address">
        <div className="address1">{props.home.address.address1}</div>
        <div className="zip">{props.home.address.postalCode}</div>
        <div className="city">{props.home.address.city}</div>
      </div>
      {props.children}
    </div>
  )
}
