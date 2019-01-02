import React, { Component } from 'react'
import { match } from 'react-router'
import { Redirect } from 'react-router'

import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk'
import * as dataprep from '../../lib/dataprep'

import Alert from '../components/Alert'
import Graphs from './Graphs'
import { storeSnapshot } from '../../lib/store'

import './GraphLoader.css'

type Params = {
  id: string
  priceAreaCode: string
  gridAreaCode: string
}

type Props = {
  match: match<Params>
}

type State = {
  home: {
    id: string
    priceAreaCode: string
    gridAreaCode: string
  }
  days?: dataprep.Day[]
  consumption?: tibber.ConsumptionNode[]
  price?: tibber.PriceNode[]
  profile?: svk.ProfileNode[]
  error?: Error

  storing: boolean
  redict?: string
}

class GraphLoader extends Component<Props, State> {
  readonly state: State = {
    home: {
      id: '',
      priceAreaCode: '',
      gridAreaCode: '',
    },
    storing: false,
  }

  async componentDidMount() {
    const homeId = this.props.match.params.id
    const { gridAreaCode, priceAreaCode } = this.props.match.params

    const period = 32 * 24
    try {
      let consumption = await tibber.getConsumption(homeId, tibber.Interval.Hourly, period)
      // price is sometimes ahead by 24 hours, so we always add another period on it
      let price = await tibber.getPrice(homeId, tibber.Interval.Hourly, period + 24)

      let profileCsv = await svk.getProfile(gridAreaCode, period)
      let profile = svk.parseCSV(profileCsv)

      const days = dataprep.aggregateDays(consumption, price, profile)

      this.setState({
        ...this.state,
        home: {
          id: homeId,
          priceAreaCode,
          gridAreaCode,
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
    this.setState({
      ...this.state,
      storing: true,
    })
    try {
      const id = await storeSnapshot({
        home: this.state.home!,
        consumptionNodes: this.state.consumption!,
        priceNodes: this.state.price!,
        profileNodes: this.state.profile!,
      })

      this.setState({
        ...this.state,
        storing: false,
        redict: id,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        storing: false,
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

    if (this.state.storing) {
      return <Alert>Sparar snapshot...</Alert>
    }

    if (!this.state.consumption || !this.state.profile || !this.state.days) {
      return <Alert>Laddar...</Alert>
    }

    if (this.state.days.length == 0) {
      return <Alert type="oh-no">Hämtningsfel</Alert>
    }

    return (
      <div className="graph-view">
        <div className="header-info">
          <a href="javascript:;" onClick={this.store.bind(this)}>
            Spara snapshot
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
