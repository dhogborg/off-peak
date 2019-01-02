import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment'

import * as tibber from '../lib/tibber'
import * as store from '../lib/store'

import Alert from '../app/components/Alert'

import './List.css'

type Props = {}
type State = {
  snapshots?: HomeSnapshot[]
  error?: string
}

export default class List extends Component<Props, State> {
  state: State = {}

  constructor(readonly props: Props) {
    super(props)
  }

  async componentDidMount() {
    try {
      const homes = await tibber.getHomes()
      let snapshots: HomeSnapshot[] = []

      for (let h of homes) {
        const page = await store.getSnapshots(h.id)
        if (!page || !page.snapshots) {
          continue
        }

        for (let s of page.snapshots) {
          snapshots.push({
            snapshot: s,
            home: h,
          })
        }
      }

      snapshots.sort((a, b) => {
        if (a.snapshot.created_at == b.snapshot.created_at) return 0
        if (a.snapshot.created_at > b.snapshot.created_at) return -1
        return 1
      })

      this.setState({
        ...this.state,
        snapshots,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        snapshots: undefined,
        error: err.message,
      })
    }
  }

  dateFormat(d: string): string {
    const m = moment(d)
    return m.format('YYYY-MM-DD HH:mm')
  }

  render() {
    if (this.state.error) {
      return <Alert type="oh-no">{this.state.error}</Alert>
    }

    if (!this.state.snapshots) {
      return <Alert>Laddar...</Alert>
    }

    if (this.state.snapshots.length == 0) {
      return <Alert>Inga snapshots sparade</Alert>
    }

    return (
      <div className="list">
        <table>
          <thead>
            <th>Skapad</th>
            <th>Hem</th>
            <th>Område</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </thead>
          <tbody>
            {this.state.snapshots.map((s) => {
              return (
                <tr>
                  <td>{this.dateFormat(s.snapshot.created_at)}</td>
                  <td>
                    {s.home.address.address1}, {s.home.address.city}
                  </td>
                  <td>
                    {s.home.meteringPointData.priceAreaCode}/{s.home.meteringPointData.gridAreaCode}
                  </td>
                  <td>
                    <Link className="btn-view" to={`/snaps/${s.snapshot.id}/graphs`}>
                      Visa
                    </Link>
                  </td>
                  <td>
                    <CopyToClipboard
                      text={`${window.location.origin}/snaps/${s.snapshot.id}/graphs`}>
                      <span className="copy-link">
                        🔗
                        <div className="popover">Kopiera&nbsp;URL</div>
                      </span>
                    </CopyToClipboard>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

interface HomeSnapshot {
  home: tibber.Home
  snapshot: store.Snapshot
}
