import classnames from 'classnames'

import * as dataprep from '../../lib/dataprep'
import * as config from '../../lib/config'

import './DataBoxes.css'
import { useDispatch, useSelector } from 'src/lib/hooks'

import { DataSourceContext } from './Graphs'
import { useContext } from 'react'

type Props = {
  days: dataprep.Day[]
  weightedAverage: number
}

const dayIsComplete = (day: dataprep.Day) => {
  return (
    day.potentialCost !== undefined && day.totalCost !== undefined && day.consumption !== undefined
  )
}

const DataBoxes = function (props: Props) {
  // clear out the incomplete days
  const completeDays = props.days.filter(dayIsComplete)

  // The cost when charged hourly rate
  const totalCost = completeDays.map((day) => day.totalCost).reduce((p, v) => p + v, 0)
  // Total consumption
  const consumption = completeDays.map((day) => day.consumption).reduce((p, v) => p + v, 0)
  // The alternative cost, or savings from using off-peak electricity
  const potentialCost = consumption * props.weightedAverage

  // let potentialCost: number
  // if (useBeta) {
  //   potentialCost = consumption * props.weightedAverage
  // } else {
  //   potentialCost = completeDays.map((day) => day.potentialCost).reduce((p, v) => p + v, 0)
  // }

  return (
    <div className="info-box">
      <div className="col">
        <Consumed consumption={consumption} totalCost={totalCost} dayCount={completeDays.length} />
      </div>
      <div className="col">
        <CostInfo totalCost={totalCost} potentialCost={potentialCost} />
      </div>
      {!isNaN(potentialCost) ? (
        <div className="how-did-i-do">
          {totalCost < potentialCost ? (
            <span>Du sparar pengar genom att använda off-peak el, nice.</span>
          ) : (
            <span>
              Du betalade mer under denna period jämfört med ett rörligt avtal med viktat spotpris.
              Detta kan bero på att du använt prylar som drar mycket el under dyra timmar, eller att
              du inte använt mycket el under dygnets billiga timmar. Se histogrammet längre ner.
            </span>
          )}
        </div>
      ) : null}
      <div className="fine-print">
        * Spotpriset per timme gånger din konsumtion viktat per timme för snitthushållet i ditt
        område. Dvs vad du hade betalt utan timavräkning.
      </div>
      <div className="fine-print">Alla kostnader ink moms</div>
    </div>
  )
}

export default DataBoxes

const CostInfo = function (props: { totalCost: number; potentialCost: number }) {
  const currency = 'SEK'

  const deltaCost = props.potentialCost - props.totalCost
  const deltaLabelCl = classnames('currency', {
    nice: deltaCost > 0,
    ouch: deltaCost < 0,
  })

  let savedCost = '...'
  let savedPercentage = '...'
  let potentialCost = 'Väntar på data'
  if (!isNaN(deltaCost) && !isNaN(props.potentialCost)) {
    savedCost = deltaCost.toFixed(0) + ' ' + currency
    potentialCost = props.potentialCost.toFixed(0) + ' ' + currency
    savedPercentage = (-100 * (props.totalCost / props.potentialCost - 1)).toFixed(0) + '%'
  }

  return (
    <div className="cost-box">
      <dl>
        <dt>Kostnad med timavräkning</dt>
        <dd>
          <label className="currency hour-cost">
            {props.totalCost.toFixed(0)} {currency}
          </label>
        </dd>
        <dt>Kostnad med viktat spotpris*</dt>

        <dd>
          <label className="currency spot-cost">{potentialCost}</label>
        </dd>
        <dt>Sparat</dt>
        <dd>
          <label className={deltaLabelCl}>
            {savedCost} / {savedPercentage}
          </label>
        </dd>
      </dl>
    </div>
  )
}

const Consumed = function (props: { consumption: number; totalCost: number; dayCount: number }) {
  const dispatch = useDispatch()
  const configState = useSelector(config.selector)
  const dataSource = useContext(DataSourceContext)

  const renderPeriod = (p: config.PeriodTypes) => {
    switch (p) {
      case 'last-year':
        return <span>förra året</span>
      case 'this-year':
        return <span>sedan 1a Januari i år</span>
      case 'running-year':
        return <span>sedan dagens datum förra året</span>
      case 'last-month':
        return <span>förra månaden</span>
      case 'this-month':
        return <span>sedan den 1e i månaden</span>
      case 'rolling':
        return <span>senaste {props.dayCount} dagarna</span>
    }
  }

  const link = (
    <button
      className="btn-link period-switch"
      key={configState.periodType}
      onClick={() => {
        let p: config.PeriodTypes
        switch (configState.periodType) {
          case 'last-year':
            p = 'this-year'
            break
          case 'this-year':
            p = 'running-year'
            break
          case 'running-year':
            p = 'last-month'
            break
          case 'last-month':
            p = 'rolling'
            if (new Date().getDate() === 1) {
              p = 'rolling'
            } else {
              p = 'this-month'
            }
            break
          case 'this-month':
            p = 'rolling'
            break
          case 'rolling':
            p = 'last-year'
            break
        }
        dispatch(config.setPeriod(p))
      }}>
      {dataSource === 'api' ? renderPeriod(configState.periodType) : null}
    </button>
  )

  const avgPrice = props.totalCost / props.consumption
  return (
    <div className="consume-box">
      <dl>
        <dt>Konsumtion {link}</dt>
        <dd>
          <label className="consumption">{props.consumption.toFixed(0)} kWh</label>
        </dd>
        <dt>Snittpris per kWh</dt>
        <dd>
          <label className="consumption">{(avgPrice * 100).toFixed(1)} öre</label>
        </dd>
      </dl>
    </div>
  )
}
