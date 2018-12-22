import React, { Component, ReactNode } from 'react'
import { Redirect } from 'react-router'

import * as tibber from '../lib/tibber'
import Alert from '../components/Alert'

import './Homes.css'

type Props = {}
type State = {
  homes?: tibber.Home[]
  error?: string
  redict?: tibber.Home
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
        redict,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: err.message,
      })
    }
  }

  clickedHome(home: tibber.Home) {
    this.setState({
      ...this.state,
      redict: home,
    })
  }

  render() {
    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error}</Alert>
    }

    if (!this.state.homes) {
      return <Alert>Loading...</Alert>
    }

    if (this.state.homes.length == 0) {
      return <Alert>There are no homes on your account</Alert>
    }

    if (this.state.redict) {
      const home = this.state.redict
      const { priceAreaCode, gridAreaCode } = this.state.redict.meteringPointData
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
