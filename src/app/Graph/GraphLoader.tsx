import { useEffect, useState } from 'react'
import { match } from 'react-router'

import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk/'
import * as dataprep from '../../lib/dataprep'
import * as config from '../../lib/config'

import Alert from '../components/Alert'
import Graphs from './Graphs'
import * as snapshotStore from '../../lib/snapshots'

import './GraphLoader.css'
import { useDispatch, useSelector } from 'src/lib/hooks'
import { push } from 'connected-react-router'

import { DataSourceContext } from './Graphs'
import { getYearIntervalFor, getMonthIntervalFor } from './GraphLoader.lib'

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

  useEffect(() => {
    dispatch(snapshotStore.reset())
  }, [dispatch])

  useEffect(() => {
    let first: number | undefined = undefined
    let last: number | undefined = undefined
    let after: Date | undefined = undefined
    const now = new Date()
    switch (configState.periodType) {
      case 'last-year': {
        let prevYear = now.getFullYear() - 1
        const period = getYearIntervalFor(prevYear)
        after = period.from
        first = period.hours
        break
      }
      case 'this-year': {
        let year = now.getFullYear()
        const period = getYearIntervalFor(year)
        after = period.from
        first = period.hours
        break
      }
      case 'running-year': {
        last = last = 365 * 24
        break
      }
      case 'last-month': {
        let prevMonth = now.getMonth() - 1
        if (prevMonth < 0) prevMonth = 11

        const period = getMonthIntervalFor(prevMonth)
        after = period.from
        first = period.hours
        break
      }
      case 'this-month': {
        const period = getMonthIntervalFor(now.getMonth())
        after = period.from
        first = period.hours
        break
      }
      case 'rolling':
        last = last = 32 * 24
        break
    }

    console.log({ after, last, first })

    dispatch(
      tibber.getConsumption({ homeId, resolution: tibber.Interval.Hourly, after, first, last })
    )

    // price is sometimes ahead by 24 hours, so we always add another period on it
    dispatch(tibber.getPrice({ homeId, resolution: tibber.Interval.Hourly, after, first, last }))

    dispatch(svk.getProfile({ area: gridAreaCode, period: configState.periodType }))

    setFirstLoad(false)
  }, [dispatch, homeId, configState.periodType, gridAreaCode])

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
        profileNodes: svkState.nodes,
      })
    )
  }

  useEffect(() => {
    if (snapshotState.addId) {
      dispatch(push(`/snaps/${snapshotState.addId}/graphs`))
      dispatch(snapshotStore.reset())
    }
  }, [dispatch, snapshotState.addId])

  if (
    firstLoad ||
    tibberState.homes.status === 'loading' ||
    tibberState.consumption.status === 'loading' ||
    tibberState.price.status === 'loading' ||
    svkState.status === 'loading'
  ) {
    return <Alert>Laddar...</Alert>
  }

  if (snapshotState.addStatus === 'loading' || snapshotState.addId) {
    return <Alert>Sparar snapshot...</Alert>
  }

  const errs = Object.entries({
    snapshot: snapshotState.addError,
    consumption: tibberState.consumption.error,
    price: tibberState.price.error,
    profile: svkState.error,
  }).filter(([, err]) => !!err)

  if (errs.length > 0) {
    return (
      <>
        {errs.map(([id, err], i) => {
          return (
            <Alert key={i} type="oh-no">
              <h2>{id} error</h2>
              {err}
            </Alert>
          )
        })}
      </>
    )
  }

  const { days, weightedAverage } = dataprep.aggregateDays(
    tibberState.consumption.nodes,
    tibberState.price.nodes,
    svkState.nodes
  )

  if (!firstLoad && days.length === 0) {
    return <Alert type="oh-no">Hämtningsfel, data saknas</Alert>
  }

  return (
    <div className="graph-view">
      <div className="header-info">
        <button id="BtnSaveSnapshot" onClick={store}>
          Spara snapshot
        </button>
      </div>
      <DataSourceContext.Provider value={'api'}>
        <Graphs
          days={days}
          consumption={tibberState.consumption.nodes}
          profile={svkState.nodes}
          weightedAverage={weightedAverage}
          price={tibberState.price.nodes}
        />
      </DataSourceContext.Provider>
    </div>
  )
}
