import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment'

import * as tibber from '../lib/tibber'
import * as snapshots from '../lib/snapshots'

import Alert from '../app/components/Alert'

import './List.css'

import { useDispatch, useSelector } from 'src/lib/hooks'

export default function List() {
  const dispatch = useDispatch()
  const tibberState = useSelector(tibber.selector)
  const snapState = useSelector(snapshots.selector)

  useEffect(() => {
    if (tibberState.homes.items === undefined) {
      dispatch(tibber.getHomes())
    }
  }, [dispatch, tibberState.homes.items])

  useEffect(() => {
    tibberState.homes.items?.forEach((home) => dispatch(snapshots.getAll({ homeId: home.id })))
  }, [dispatch, tibberState.homes.items])

  const errs = [tibberState.homes.error, snapState.error].filter((err) => !!err)
  if (errs.length > 0) {
    return (
      <>
        {errs.map((err) => {
          return <Alert type="oh-no">{err}</Alert>
        })}
      </>
    )
  }

  if (tibberState.homes.status === 'loading' || snapState.status === 'loading') {
    return <Alert>Laddar...</Alert>
  }

  const all = Object.keys(snapState.items)
    .map((k) => snapState.items[k])
    .filter((item) => item.owner === true)
    .map((item) => {
      return {
        snapshot: item.snapshot,
        home: tibberState.homes.map[item.snapshot.home.id],
      }
    })
    .sort((a, b) => {
      if (a.snapshot.created_at === b.snapshot.created_at) return 0
      if (a.snapshot.created_at > b.snapshot.created_at) return -1
      return 1
    })

  if (all.length === 0) {
    return <Alert>Inga snapshots sparade</Alert>
  }

  return (
    <div className="list">
      <table>
        <thead>
          <tr>
            <th>Skapad</th>
            <th>Hem</th>
            <th>Område</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {all.map((s) => {
            if (!s.home) {
              return <></>
            }
            return (
              <tr key={s.snapshot.id}>
                <td>{dateFormat(s.snapshot.created_at)}</td>
                <td>
                  {s.home.address.address1}, {s.home.address?.city}
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

const dateFormat = (d: string): string => {
  const m = moment(d)
  return m.format('YYYY-MM-DD HH:mm')
}
