import React, { useEffect, useState } from 'react'
import { match } from 'react-router'

import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk/'
import * as dataprep from '../../lib/dataprep'
import * as config from '../../lib/config'

import Alert from '../components/Alert'
import Graphs from './Graphs'
import * as snapshotStore from '../../lib/snapshots'

import './GraphLoader.css'
import { useDispatch, useSelector } from 'react-redux'
import { push } from 'connected-react-router'

type Params = {
  id: string
  priceAreaCode: string
  gridAreaCode: string
}

type Props = {
  match: match<Params>
}

export default function GraphLoader(props: Props) {
  const dispatch = useDispatch()
  const [firstLoad, setFirstLoad] = useState(true)

  const tibberState = useSelector(tibber.selector)
  const snapshotState = useSelector(snapshotStore.selector)
  const svkState = useSelector(svk.selector)
  const configState = useSelector(config.selector)

  const { gridAreaCode, priceAreaCode } = props.match.params
  const homeId = props.match.params.id

  let period = 32 * 24
  if (configState.periodType === 'monthly') {
    period = new Date().getDate() * 24
  }

  useEffect(() => {
    dispatch(snapshotStore.reset())
  }, [])

  useEffect(
    () => {
      console.log({ period })

      dispatch(tibber.getConsumption({ homeId, interval: tibber.Interval.Hourly, last: period }))
      // price is sometimes ahead by 24 hours, so we always add another period on it
      dispatch(tibber.getPrice({ homeId, interval: tibber.Interval.Hourly, last: period + 24 }))

      dispatch(svk.getProfile({ area: gridAreaCode, last: period }))

      setFirstLoad(false)
    },
    [homeId, period, gridAreaCode]
  )

  const store = async () => {
    dispatch(
      snapshotStore.add({
        home: {
          id: homeId,
          priceAreaCode,
          gridAreaCode,
        },
        consumptionNodes: tibberState.consumption.nodes,
        priceNodes: tibberState.price.nodes,
        profileNodes: svkState.nodes!,
      })
    )
  }

  useEffect(
    () => {
      if (snapshotState.addId) {
        dispatch(push(`/snaps/${snapshotState.addId}/graphs`))
        dispatch(snapshotStore.reset())
      }
    },
    [snapshotState.addId]
  )

  if (
    firstLoad ||
    tibberState.homes.status === 'loading' ||
    tibberState.consumption.status === 'loading' ||
    svkState.status === 'loading'
  ) {
    return <Alert>Laddar...</Alert>
  }

  if (snapshotState.addStatus === 'loading' || snapshotState.addId) {
    return <Alert>Sparar snapshot...</Alert>
  }

  const errs = [
    snapshotState.addError,
    tibberState.consumption.error,
    tibberState.price.error,
    svkState.error,
  ].filter((err) => !!err)
  if (errs.length > 0) {
    return (
      <>
        {errs.map((err) => {
          return <Alert type="oh-no">{err}</Alert>
        })}
      </>
    )
  }

  const days = dataprep.aggregateDays(
    tibberState.consumption.nodes,
    tibberState.price.nodes,
    svkState.nodes!
  )

  if (!firstLoad && days.length == 0) {
    return <Alert type="oh-no">Hämtningsfel, data saknas</Alert>
  }

  return (
    <div className="graph-view">
      <div className="header-info">
        <button id="BtnSaveSnapshot" onClick={store}>
          Spara snapshot
        </button>
      </div>
      <Graphs days={days} consumption={tibberState.consumption.nodes} profile={svkState.nodes!} />
    </div>
  )
}
