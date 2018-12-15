import React, { Component } from 'react'
import { match } from 'react-router'
import moment from 'moment'

import * as dataprep from '../lib/dataprep'
import * as store from '../lib/store'

import Alert from '../components/Alert'
import Graphs from '../components/Graphs'

import './SnapLoader.css'

type Params = {
  id: string
}

type Props = {
  match: match<Params>
}

type State = {
  snapshot?: store.Snapshot
  days?: dataprep.Day[]
  error?: Error
}

class SnapLoader extends Component<Props, State> {
  readonly state: State = {}

  async componentDidMount() {
    try {
      const snapshot = await store.getSnapshot(this.props.match.params.id)
      const days = dataprep.aggregateDays(
        snapshot.consumptionNodes,
        snapshot.priceNodes,
        snapshot.profileNodes
      )

      this.setState({
        ...this.state,
        snapshot,
        days,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: new Error(err),
      })
    }
  }

  homeArea(): string {
    switch (this.state.snapshot!.home.area) {
      case 'SN0':
        return 'Hela sverige'
      case 'SN1':
        return 'Norra norrland'
      case 'SN2':
        return 'Södra norrland'
      case 'SN3':
        return 'Mellansverige'
      case 'SN4':
        return 'Södra sverige'
      default:
        return 'Okänd landsände'
    }
  }

  dateFmt(date: string): string {
    const m = moment(date)
    return m.format('YYYY-MM-DD')
  }

  render() {
    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error.message}</Alert>
    }

    if (!this.state.snapshot) {
      return <Alert>Loading...</Alert>
    }

    if (!this.state.days || this.state.days.length == 0) {
      return <Alert type="oh-no">Data retreival error</Alert>
    }

    const fromDate = this.state.snapshot.priceNodes[0].startsAt
    const toDate = this.state.snapshot.priceNodes[this.state.snapshot.priceNodes.length - 1]
      .startsAt

    return (
      <div className="snap-view">
        <div className="header-info">
          This is a snapshot of a home in {this.homeArea()} from {this.dateFmt(fromDate)} to{' '}
          {this.dateFmt(toDate)}
        </div>
        <Graphs
          days={this.state.days}
          consumption={this.state.snapshot.consumptionNodes}
          profile={this.state.snapshot.profileNodes}
        />
      </div>
    )
  }
}

export default SnapLoader
