import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment'

import * as tibber from '../lib/tibber'
import * as snapshotStore from '../lib/snapshots'

import Alert from '../app/components/Alert'

import './List.css'
import { errorString } from '../lib/helpers'
import { useAppDispatch } from '../lib/hooks'
import { useSelector } from 'react-redux'

type State = {
  snapshots?: HomeSnapshot[]
  error?: string
}

export default function List() {
  const dispatch = useAppDispatch()
  const [state, setState] = useState<State>({})
  const tibberState = useSelector(tibber.selector)

  useEffect(
    () => {
      dispatch(tibber.getHomes())
    },
    [dispatch]
  )

  useEffect(() => {
    ;(async () => {
      try {
        let snapshots: HomeSnapshot[] = []
        for (let h of tibberState.homes.items) {
          const page = await snapshotStore.getAll(h.id)
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

        setState({
          ...state,
          snapshots,
        })
      } catch (err) {
        setState({
          ...state,
          snapshots: undefined,
          error: errorString(err),
        })
      }
    })()
  }, tibberState.homes.items)

  if (state.error) {
    return <Alert type="oh-no">{state.error}</Alert>
  }

  if (!state.snapshots) {
    return <Alert>Laddar...</Alert>
  }

  if (state.snapshots.length == 0) {
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
          {state.snapshots.map((s) => {
            return (
              <tr>
                <td>{dateFormat(s.snapshot.created_at)}</td>
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
                  <CopyToClipboard text={`${window.location.origin}/snaps/${s.snapshot.id}/graphs`}>
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

interface HomeSnapshot {
  home: tibber.Home
  snapshot: snapshotStore.Snapshot
}

const dateFormat = (d: string): string => {
  const m = moment(d)
  return m.format('YYYY-MM-DD HH:mm')
}
