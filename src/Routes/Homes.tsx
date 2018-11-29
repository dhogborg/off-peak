import React, { Component, ReactNode, SyntheticEvent } from 'react'
import { Redirect } from 'react-router'

import * as tibber from '../lib/tibber'
import * as svk from '../lib/svk'
import Alert from '../components/Alert'

import './Homes.css'

type Props = {}
type State = {
  homes?: tibber.Home[]
  error?: string
  redict?: tibber.Home
  svkAreas: { [key: string]: svk.Area }
}

export default class Homes extends Component<Props, State> {
  state: State = {
    svkAreas: {},
  }

  constructor(readonly props: Props) {
    super(props)
  }

  async componentDidMount() {
    try {
      const homes = await tibber.getHomes()
      const redict = homes.length == 1 ? homes[0] : undefined

      const svkAreas: { [key: string]: svk.Area } = {}
      for (let home of homes) {
        const sn = svk.searchSN(home.address.postalCode, home.address.city)
        if (sn) {
          svkAreas[home.id] = sn
        }
      }

      this.setState({
        ...this.state,
        homes,
        redict,
        svkAreas,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: err,
      })
    }
  }

  clickedHome(home: tibber.Home) {
    if (!this.state.svkAreas[home.id]) {
      return
    }

    this.setState({
      ...this.state,
      redict: home,
    })
  }

  setArea(event: React.FormEvent<HTMLInputElement>) {
    let target = event.target as HTMLInputElement

    const home = this.state.homes!.filter((home) => {
      return home.id == target.id ? home : undefined
    })

    let area = target.value as svk.Area
    this.setState({
      ...this.state,
      redict: home[0],
      svkAreas: {
        ...this.state.svkAreas,
        [target.id]: area,
      },
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
      const area = this.state.svkAreas[this.state.redict.id]
      const id = this.state.redict.id
      return <Redirect to={`/homes/${area}/${id}/graphs`} />
    }

    return (
      <div className="homes">
        {this.state.homes.map((home) => {
          return (
            <Home key={home.id} home={home} onClick={this.clickedHome.bind(this)}>
              {this.state.svkAreas[home.id] ? (
                <div>Area {this.state.svkAreas[home.id]}</div>
              ) : (
                <div>
                  <select
                    id={home.id}
                    value={this.state.svkAreas[home.id]}
                    onChange={this.setArea.bind(this)}>
                    <option value="">Select area</option>
                    <option value="SN1">SN 1 (Luleå)</option>
                    <option value="SN2">SN 2 (Sundsvall)</option>
                    <option value="SN3">SN 3 (Stockholm)</option>
                    <option value="SN4">SN 4 (Malmö)</option>
                  </select>
                </div>
              )}
            </Home>
          )
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
