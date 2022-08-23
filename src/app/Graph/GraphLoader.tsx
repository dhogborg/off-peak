import React, { Component, useEffect, useState } from 'react'
import { match } from 'react-router'
import { Redirect } from 'react-router'

import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk'
import * as dataprep from '../../lib/dataprep'

import Alert from '../components/Alert'
import Graphs from './Graphs'
import * as snapshotStore from '../../lib/snapshots'

import './GraphLoader.css'
import { errorString } from '../../lib/helpers'
import { useAppDispatch } from '../../lib/hooks'
import { useSelector } from 'react-redux'

type Params = {
  id: string
  priceAreaCode: string
  gridAreaCode: string
}

type Props = {
  match: match<Params>
}

type State = {
  profile?: svk.ProfileNode[]
  error?: string

  storing: boolean
  redirect?: string
}

export default function GraphLoader(props: Props) {
  const dispatch = useAppDispatch()
  const tibberState = useSelector(tibber.selector)
  const [state, setState] = useState<State>({
    storing: false,
  })

  const period = 32 * 24
  const { gridAreaCode, priceAreaCode } = props.match.params
  const homeId = props.match.params.id

  useEffect(
    () => {
      dispatch(tibber.getConsumption({ homeId, interval: tibber.Interval.Hourly, last: period }))
      // price is sometimes ahead by 24 hours, so we always add another period on it
      dispatch(tibber.getPrice({ homeId, interval: tibber.Interval.Hourly, last: period + 24 }))
    },
    [dispatch, homeId, period]
  )

  useEffect(
    () => {
      ;(async () => {
        try {
          const profileCsv = await svk.getProfile(gridAreaCode, period)
          const profile = svk.parseCSV(profileCsv)

          setState({
            ...state,
            profile,
          })
        } catch (err) {
          setState({
            ...state,
            error: 'Unable to load data: ' + errorString(err),
          })
        }
      })()
    },
    [gridAreaCode, period]
  )

  const store = async () => {
    setState({
      ...state,
      storing: true,
    })
    try {
      const id = await snapshotStore.store({
        home: {
          id: homeId,
          priceAreaCode,
          gridAreaCode,
        },
        consumptionNodes: tibberState.consumption.nodes,
        priceNodes: tibberState.price.nodes,
        profileNodes: state.profile!,
      })

      setState({
        ...state,
        storing: false,
        redirect: id,
      })
    } catch (err) {
      setState({
        ...state,
        storing: false,
        error: errorString(err),
      })
    }
  }

  if (state.redirect) {
    return <Redirect to={`/snaps/${state.redirect}/graphs`} />
  }

  if (state.error) {
    return <Alert type="oh-no">{state.error}</Alert>
  }

  if (state.storing) {
    return <Alert>Sparar snapshot...</Alert>
  }

  if (
    tibberState.consumption.status === 'loading' ||
    tibberState.price.status === 'loading' ||
    !state.profile
  ) {
    return <Alert>Laddar...</Alert>
  }

  const days = dataprep.aggregateDays(
    tibberState.consumption.nodes,
    tibberState.price.nodes,
    state.profile
  )

  if (days.length == 0) {
    return <Alert type="oh-no">Hämtningsfel</Alert>
  }

  return (
    <div className="graph-view">
      <div className="header-info">
        <a href="javascript:;" onClick={store}>
          Spara snapshot
        </a>
      </div>
      <Graphs days={days} consumption={tibberState.consumption.nodes} profile={state.profile} />
    </div>
  )
}
