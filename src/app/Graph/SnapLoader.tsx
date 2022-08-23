import React, { Component, useEffect, useState } from 'react'
import { match } from 'react-router'
import moment from 'moment'

import { useAppDispatch, useAppSelector } from '../../lib/hooks'

import * as dataprep from '../../lib/dataprep'
import * as snapshots from '../../lib/snapshots'

import Alert from '../components/Alert'
import Graphs from './Graphs'

import './SnapLoader.css'

type Params = {
  id: string
}

type Props = {
  match: match<Params>
}

export default function SnapLoader(props: Props) {
  const dispatch = useAppDispatch()
  const snapshotState = useAppSelector(snapshots.selector)

  useEffect(
    () => {
      dispatch(snapshots.getOne(props.match.params.id))
    },
    [dispatch]
  )

  const item = snapshotState.items[props.match.params.id]

  if (item && item.status === 'failed') {
    return <Alert type="oh-no">{item.error}</Alert>
  }

  if (!item || item.status === 'loading' || !item.snapshot) {
    return <Alert>Laddar...</Alert>
  }

  const { consumptionNodes, priceNodes, profileNodes } = item.snapshot
  if (!consumptionNodes || !priceNodes || !profileNodes) {
    return <Alert>Laddar...</Alert>
  }

  const days = dataprep.aggregateDays(consumptionNodes, priceNodes, profileNodes)

  if (!days || days.length == 0) {
    return <Alert type="oh-no">Hämtningsfel</Alert>
  }

  const fromDate = priceNodes[0].startsAt
  const toDate = priceNodes[priceNodes.length - 1].startsAt

  return (
    <div className="snap-view">
      <div className="header-info">
        Detta är ett snapshot av ett hem i {homeArea(item.snapshot.home.priceAreaCode)} från{' '}
        {dateFmt(fromDate)} till {dateFmt(toDate)}
      </div>
      <Graphs days={days} consumption={consumptionNodes} profile={profileNodes} />
    </div>
  )
}

const homeArea = (priceAreaCode: string): string => {
  switch (priceAreaCode) {
    case 'SN0':
    case 'SE0':
      return 'Hela sverige'
    case 'SN1':
    case 'SE1':
      return 'Norra norrland'
    case 'SN2':
    case 'SE2':
      return 'Södra norrland'
    case 'SN3':
    case 'SE3':
      return 'Mellansverige'
    case 'SN4':
    case 'SE4':
      return 'Södra sverige'
    default:
      return 'Okänd landsände'
  }
}

const dateFmt = (date: string): string => {
  const m = moment(date)
  return m.format('YYYY-MM-DD')
}
