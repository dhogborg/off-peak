import { useEffect, useState } from 'react'
import { match } from 'react-router'

import moment from 'moment'
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

  let period: number
  switch (configState.periodType) {
    case 'last-year': {
      const now = moment().subtract(1, 'year');
      const start = moment(now.format('YYYY')).date(1).hour(0).minute(0).second(0)
      const diff = moment.duration(now.diff(start))
      period = Math.ceil(diff.as('hours'))
      break
    }
    case 'this-year': {
      const now = moment()
      const start = moment(now.format('YYYY')).date(1).hour(0).minute(0).second(0)
      const diff = moment.duration(now.diff(start))
      period = Math.ceil(diff.as('hours'))
      break
    }
    case 'last-month': {
      const now = moment()
      const start = moment().subtract(1, 'month').date(1).hour(0).minute(0).second(0)
      const diff = moment.duration(now.diff(start))
      period = Math.ceil(diff.as('hours'))
      break
    }
    case 'this-month':
      period = new Date().getDate() * 24
      break
    case 'rolling':
      period = period = 32 * 24
      break
  }

  useEffect(() => {
    dispatch(snapshotStore.reset())
  }, [dispatch])

  useEffect(() => {
    dispatch(tibber.getConsumption({ homeId, interval: tibber.Interval.Hourly, last: period }))
    // price is sometimes ahead by 24 hours, so we always add another period on it
    dispatch(tibber.getPrice({ homeId, interval: tibber.Interval.Hourly, last: period + 24 }))

    dispatch(svk.getProfile({ area: gridAreaCode, period: configState.periodType }))

    setFirstLoad(false)
  }, [dispatch, homeId, period, configState.periodType, gridAreaCode])

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

  const { days, weightedAverage } = dataprep.aggregateDays(
    tibberState.consumption.nodes,
    tibberState.price.nodes,
    svkState.nodes
  )

  if (!firstLoad && days.length === 0) {
    localStorage.removeItem('period');
    setTimeout(() =>  
      dispatch(config.setPeriod('rolling'))
    , 2500);
    return <Alert type="oh-no">Data saknas för vald period, laddar tidigare data.</Alert> 
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
        />
      </DataSourceContext.Provider>
    </div>
  )
}
