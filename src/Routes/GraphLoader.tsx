import React, { Component } from 'react'
import { match } from 'react-router'
import { Redirect } from 'react-router'

import * as tibber from '../lib/tibber'
import * as svk from '../lib/svk'
import * as dataprep from '../lib/dataprep'

import Alert from '../components/Alert'
import Graphs from '../components/Graphs'
import { storeSnapshot } from '../lib/store'

import './GraphLoader.css'

type Params = {
  id: string
  sn: string
}

type Props = {
  match: match<Params>
}

type State = {
  home: {
    id: string
    area: string
  }
  days?: dataprep.Day[]
  consumption?: tibber.ConsumptionNode[]
  price?: tibber.PriceNode[]
  profile?: svk.ProfileNode[]
  error?: Error

  redict?: string
}

class GraphLoader extends Component<Props, State> {
  readonly state: State = {
    home: {
      id: '',
      area: '',
    },
  }

  async componentDidMount() {
    const homeId = this.props.match.params.id
    const networkArea = this.props.match.params.sn as svk.Area

    const period = 32 * 24
    try {
      let consumption = await tibber.getConsumption(homeId, tibber.Interval.Hourly, period)
      // price is sometimes ahead by 24 hours, so we always add another period on it
      let price = await tibber.getPrice(homeId, tibber.Interval.Hourly, period + 24)

      let profileCsv = await svk.getProfile(networkArea, period)
      let profile = svk.parseCSV(profileCsv)

      const days = dataprep.aggregateDays(consumption, price, profile)

      this.setState({
        ...this.state,
        home: {
          id: homeId,
          area: networkArea,
        },
        days,
        consumption,
        price,
        profile,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: new Error('Unable to load data: ' + err),
      })
    }
  }

  async store() {
    try {
      const id = await storeSnapshot({
        home: this.state.home!,
        consumptionNodes: this.state.consumption!,
        priceNodes: this.state.price!,
        profileNodes: this.state.profile!,
      })

      this.setState({
        ...this.state,
        redict: id,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: err,
      })
    }
  }

  render() {
    if (this.state.redict) {
      return <Redirect to={`/snaps/${this.state.redict}/graphs`} />
    }

    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error.message}</Alert>
    }

    if (!this.state.consumption || !this.state.profile || !this.state.days) {
      return <Alert>Loading...</Alert>
    }

    if (this.state.days.length == 0) {
      return <Alert type="oh-no">Data retreival error</Alert>
    }

    return (
      <div className="graph-view">
        <div className="header-info">
          <a href="javascript:;" onClick={this.store.bind(this)}>
            Share this view
          </a>
        </div>
        <Graphs
          days={this.state.days}
          consumption={this.state.consumption}
          profile={this.state.profile}
        />
      </div>
    )
  }
}

export default GraphLoader
